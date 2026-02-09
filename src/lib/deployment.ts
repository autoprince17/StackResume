import { getSupabaseAdmin } from '@/lib/db/admin'
import { generatePortfolioHTML, selectTemplate, PortfolioData } from '@/components/templates'

interface DeploymentConfig {
  vercelToken: string
  teamId?: string
}

export async function processDeploymentQueue() {
  // Get pending deployments
  const { data: queueItems, error } = await getSupabaseAdmin()
    .from('deployment_queue')
    .select('*, students(*)')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(5) // Rate limit: process 5 at a time

  if (error || !queueItems || queueItems.length === 0) {
    return { processed: 0, errors: [] }
  }

  const results = []
  const errors = []

  for (const item of queueItems as any[]) {
    try {
      await processDeployment(item.student_id)
      results.push(item.student_id)
    } catch (error) {
      console.error(`Deployment failed for ${item.student_id}:`, error)
      errors.push({ studentId: item.student_id, error: String(error) })
      
      // Update retry count
      await (getSupabaseAdmin() as any)
        .from('deployment_queue')
        .update({
          status: 'failed',
          retry_count: item.retry_count + 1,
          error_message: String(error)
        })
        .eq('id', item.id)
    }
  }

  return { processed: results.length, errors }
}

export async function processDeployment(studentId: string) {
  // 1. Fetch student data
  const { data: studentData, error: studentError } = await getSupabaseAdmin()
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()
  const student: any = studentData

  if (studentError || !student) {
    throw new Error('Student not found')
  }

  // Status guard: don't deploy rejected or edits_requested students
  if (student.status === 'rejected' || student.status === 'edits_requested') {
    throw new Error(`Cannot deploy student with status "${student.status}"`)
  }

  // 2. Fetch all related data
  const [
    { data: profileData }, 
    { data: projectsData }, 
    { data: experienceData }, 
    { data: socialLinksData }
  ] = await Promise.all([
    getSupabaseAdmin().from('profiles').select('*').eq('student_id', studentId).single(),
    getSupabaseAdmin().from('projects').select('*').eq('student_id', studentId).order('order'),
    getSupabaseAdmin().from('experience').select('*').eq('student_id', studentId).order('order'),
    getSupabaseAdmin().from('social_links').select('*').eq('student_id', studentId).single()
  ])
  
  const profile: any = profileData
  const projects: any[] = projectsData || []
  const experience: any[] = experienceData || []
  const socialLinks: any = socialLinksData

  if (!profile) {
    throw new Error('Profile not found')
  }

  // 3. Prepare portfolio data
  const portfolioData: PortfolioData = {
    student: {
      name: student.name,
      subdomain: student.subdomain || '',
      custom_domain: student.custom_domain
    },
    profile: {
      role: profile.role,
      bio: profile.bio,
      tech_stack: profile.tech_stack || [],
      skills: profile.skills || []
    },
    projects: projects || [],
    experience: experience || [],
    socialLinks: {
      github: socialLinks?.github || null,
      linkedin: socialLinks?.linkedin || null
    },
    assets: {
      profile_photo_url: null
    }
  }

  // 4. Select template and generate HTML
  const template = selectTemplate(profile.role)
  const html = generatePortfolioHTML(template, portfolioData)

  // 5. Deploy to Vercel
  const deploymentUrl = await deployToVercel({
    studentId,
    subdomain: student.subdomain || '',
    html,
    template
  })

  // 6. Update student status
  await (getSupabaseAdmin() as any)
    .from('students')
    .update({ status: 'deployed' })
    .eq('id', studentId)

  // 7. Update deployment queue
  await (getSupabaseAdmin() as any)
    .from('deployment_queue')
    .update({
      status: 'completed',
      deployment_url: deploymentUrl,
      vercel_project_id: studentId
    })
    .eq('student_id', studentId)

  return { success: true, url: deploymentUrl }
}

async function deployToVercel({
  studentId,
  subdomain,
  html,
  template
}: {
  studentId: string
  subdomain: string
  html: string
  template: string
}) {
  const config: DeploymentConfig = {
    vercelToken: process.env.VERCEL_TOKEN!,
    teamId: process.env.VERCEL_TEAM_ID
  }

  // Create or get project
  const projectName = `stackresume-${subdomain}`
  
  try {
    // Create project
    const createProjectRes = await fetch('https://api.vercel.com/v10/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        framework: null
      })
    })

    if (!createProjectRes.ok && createProjectRes.status !== 409) {
      throw new Error('Failed to create Vercel project')
    }

    const project = createProjectRes.ok ? await createProjectRes.json() : null
    const projectId = project?.id || projectName

    // Deploy static files
    const deployRes = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        project: projectId,
        files: [
          {
            file: 'index.html',
            data: Buffer.from(html).toString('base64'),
            encoding: 'base64'
          }
        ],
        target: 'production',
        routes: [
          { src: '/(.*)', dest: '/index.html' }
        ]
      })
    })

    if (!deployRes.ok) {
      const error = await deployRes.text()
      throw new Error(`Deployment failed: ${error}`)
    }

    const deployment = await deployRes.json()
    
    // Assign domain alias
    const domain = `${subdomain}.stackresume.com`
    
    await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: domain
      })
    })

    return `https://${domain}`

  } catch (error) {
    console.error('Vercel deployment error:', error)
    throw error
  }
}

export async function retryFailedDeployments() {
  const { data: failedDeployments } = await getSupabaseAdmin()
    .from('deployment_queue')
    .select('*, students(status)')
    .eq('status', 'failed')
    .lt('retry_count', 2)

  if (!failedDeployments || failedDeployments.length === 0) {
    return { retried: 0 }
  }

  let retriedCount = 0

  for (const deployment of failedDeployments as any[]) {
    // Skip deployments for rejected students or those with rejection-related errors
    const studentStatus = deployment.students?.status
    if (studentStatus === 'rejected' || studentStatus === 'edits_requested') {
      continue
    }

    const errorMsg = deployment.error_message?.toLowerCase() || ''
    if (errorMsg.includes('rejected') || errorMsg.includes('refunded')) {
      continue
    }

    // Reset to queued for retry
    await (getSupabaseAdmin() as any)
      .from('deployment_queue')
      .update({
        status: 'queued',
        error_message: null
      })
      .eq('id', deployment.id)

    retriedCount++
  }

  return { retried: retriedCount }
}

export async function undeployStudent(studentId: string) {
  const config = {
    vercelToken: process.env.VERCEL_TOKEN!,
    teamId: process.env.VERCEL_TEAM_ID
  }

  try {
    // Get student subdomain for project name
    const { data: studentData } = await getSupabaseAdmin()
      .from('students')
      .select('subdomain')
      .eq('id', studentId)
      .single()

    const student = studentData as any
    if (!student?.subdomain) {
      console.warn(`No subdomain found for student ${studentId}, skipping Vercel cleanup`)
      return { success: true }
    }

    const projectName = `stackresume-${student.subdomain}`

    // Delete Vercel project (this removes the deployment and domain aliases)
    const deleteRes = await fetch(`https://api.vercel.com/v10/projects/${projectName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${config.vercelToken}`,
      },
    })

    if (!deleteRes.ok && deleteRes.status !== 404) {
      const errorText = await deleteRes.text()
      console.error(`Failed to delete Vercel project ${projectName}:`, errorText)
      // Don't throw — best-effort cleanup
    } else {
      console.log(`Vercel project ${projectName} deleted`)
    }

    // Clean up Supabase Storage files
    const { data: files } = await getSupabaseAdmin()
      .storage
      .from('student-assets')
      .list(`${studentId}`)

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${studentId}/${f.name}`)
      await getSupabaseAdmin()
        .storage
        .from('student-assets')
        .remove(filePaths)
      console.log(`Cleaned up ${filePaths.length} storage files for student ${studentId}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Undeploy failed for student ${studentId}:`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

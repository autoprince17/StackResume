import { supabaseAdmin } from '@/lib/db/admin'
import { generatePortfolioHTML, selectTemplate, PortfolioData } from '@/components/templates'

interface DeploymentConfig {
  vercelToken: string
  teamId?: string
}

export async function processDeploymentQueue() {
  // Get pending deployments
  const { data: queueItems, error } = await supabaseAdmin
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

  for (const item of queueItems) {
    try {
      await processDeployment(item.student_id)
      results.push(item.student_id)
    } catch (error) {
      console.error(`Deployment failed for ${item.student_id}:`, error)
      errors.push({ studentId: item.student_id, error: String(error) })
      
      // Update retry count
      await supabaseAdmin
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
  const { data: student, error: studentError } = await supabaseAdmin
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    throw new Error('Student not found')
  }

  // 2. Fetch all related data
  const [{ data: profile }, { data: projects }, { data: experience }, { data: socialLinks }] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('student_id', studentId).single(),
    supabaseAdmin.from('projects').select('*').eq('student_id', studentId).order('order'),
    supabaseAdmin.from('experience').select('*').eq('student_id', studentId).order('order'),
    supabaseAdmin.from('social_links').select('*').eq('student_id', studentId).single()
  ])

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
  await supabaseAdmin
    .from('students')
    .update({ status: 'deployed' })
    .eq('id', studentId)

  // 7. Update deployment queue
  await supabaseAdmin
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
  const { data: failedDeployments } = await supabaseAdmin
    .from('deployment_queue')
    .select('*')
    .eq('status', 'failed')
    .lt('retry_count', 2)

  if (!failedDeployments || failedDeployments.length === 0) {
    return { retried: 0 }
  }

  for (const deployment of failedDeployments) {
    // Reset to queued for retry
    await supabaseAdmin
      .from('deployment_queue')
      .update({
        status: 'queued',
        error_message: null
      })
      .eq('id', deployment.id)
  }

  return { retried: failedDeployments.length }
}

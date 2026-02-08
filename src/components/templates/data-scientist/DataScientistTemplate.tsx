import { PortfolioData, generateSEOMetadata, formatDateRange } from '../utils'

export function DataScientistTemplate({ data }: { data: PortfolioData }) {
  const seo = generateSEOMetadata(data)
  const domain = data.student.custom_domain || `${data.student.subdomain}.stackresume.com`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.title}</title>
  <meta name="description" content="${seo.description}">
  <meta name="keywords" content="${seo.keywords}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #0f172a;
      background: #ffffff;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header - Dark for Data Science */
    header {
      padding: 80px 0 60px;
      background: #0f172a;
      color: white;
    }
    
    .name {
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 8px;
    }
    
    .role {
      font-size: 20px;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 24px;
    }
    
    .bio {
      font-size: 18px;
      line-height: 1.7;
      color: #cbd5e1;
      max-width: 680px;
    }
    
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 24px;
    }
    
    .tech-tag {
      background: #1e293b;
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }
    
    /* Section styling */
    section {
      padding: 60px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    section:last-of-type {
      border-bottom: none;
    }
    
    h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 32px;
    }
    
    /* Projects - Card-based for Data Science */
    .projects-grid {
      display: grid;
      gap: 24px;
    }
    
    .project {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
    }
    
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }
    
    .project-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
    
    .project-links {
      display: flex;
      gap: 16px;
    }
    
    .project-link {
      color: #059669;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    
    .project-link:hover {
      text-decoration: underline;
    }
    
    .project-description {
      color: #475569;
      line-height: 1.7;
      margin-bottom: 16px;
    }
    
    .project-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .project-tech-tag {
      background: #d1fae5;
      color: #065f46;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
    }
    
    /* Experience */
    .experience-item {
      margin-bottom: 32px;
    }
    
    .experience-item:last-child {
      margin-bottom: 0;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }
    
    .experience-role {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }
    
    .experience-date {
      font-size: 14px;
      color: #64748b;
    }
    
    .experience-org {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .experience-description {
      color: #475569;
      line-height: 1.7;
    }
    
    /* Footer */
    footer {
      padding: 40px 0;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    .social-links {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .social-link {
      color: #475569;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    
    .social-link:hover {
      color: #0f172a;
    }
    
    .copyright {
      font-size: 13px;
      color: #94a3b8;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      header {
        padding: 60px 0 40px;
      }
      
      .name {
        font-size: 32px;
      }
      
      .project-header {
        flex-direction: column;
        gap: 8px;
      }
      
      .experience-header {
        flex-direction: column;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1 class="name">${data.student.name}</h1>
      <p class="role">${data.profile.role}</p>
      <p class="bio">${data.profile.bio}</p>
      <div class="tech-stack">
        ${data.profile.tech_stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
      </div>
    </div>
  </header>

  <section id="projects">
    <div class="container">
      <h2>Projects & Analysis</h2>
      <div class="projects-grid">
        ${data.projects.map(project => `
          <article class="project">
            <div class="project-header">
              <h3 class="project-title">${project.title}</h3>
              <div class="project-links">
                <a href="${project.github_url}" class="project-link" target="_blank" rel="noopener">GitHub →</a>
                ${project.live_url ? `<a href="${project.live_url}" class="project-link" target="_blank" rel="noopener">Demo →</a>` : ''}
              </div>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
              ${project.tech_stack.map(tech => `<span class="project-tech-tag">${tech}</span>`).join('')}
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  </section>

  ${data.experience && data.experience.length > 0 ? `
  <section id="experience">
    <div class="container">
      <h2>Experience</h2>
      ${data.experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <h3 class="experience-role">${exp.role}</h3>
            <span class="experience-date">${formatDateRange(exp.start_date, exp.end_date)}</span>
          </div>
          <p class="experience-org">${exp.organization}</p>
          <p class="experience-description">${exp.description}</p>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <footer>
    <div class="container">
      <div class="social-links">
        ${data.socialLinks.github ? `<a href="${data.socialLinks.github}" class="social-link" target="_blank" rel="noopener">GitHub</a>` : ''}
        ${data.socialLinks.linkedin ? `<a href="${data.socialLinks.linkedin}" class="social-link" target="_blank" rel="noopener">LinkedIn</a>` : ''}
      </div>
      <p class="copyright">© ${new Date().getFullYear()} ${data.student.name}. Built with StackResume.</p>
    </div>
  </footer>
</body>
</html>
  `
}

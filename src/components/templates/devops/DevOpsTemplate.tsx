import { PortfolioData, generateSEOMetadata, formatDateRange, escapeHtml, sanitizeUrl } from '../utils'

export function DevOpsTemplate({ data }: { data: PortfolioData }) {
  const seo = generateSEOMetadata(data)
  const domain = data.student.custom_domain || `${data.student.subdomain}.stackresume.com`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  <meta name="keywords" content="${escapeHtml(seo.keywords)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
      background: #fafafa;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Header - Terminal style for DevOps */
    header {
      padding: 80px 0 60px;
      background: #18181b;
      color: #fafafa;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .terminal-line {
      color: #22c55e;
      margin-bottom: 16px;
      font-size: 14px;
    }
    
    .name {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 8px;
      font-family: 'Inter', sans-serif;
    }
    
    .role {
      font-size: 18px;
      color: #a1a1aa;
      font-weight: 500;
      margin-bottom: 24px;
      font-family: 'Inter', sans-serif;
    }
    
    .bio {
      font-size: 16px;
      line-height: 1.7;
      color: #d4d4d8;
      max-width: 680px;
      font-family: 'Inter', sans-serif;
    }
    
    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 24px;
    }
    
    .tech-tag {
      background: #27272a;
      color: #e4e4e7;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid #3f3f46;
    }
    
    /* Section styling */
    section {
      padding: 60px 0;
      border-bottom: 1px solid #e4e4e7;
      background: white;
    }
    
    section:last-of-type {
      border-bottom: none;
    }
    
    h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a1a1aa;
      margin-bottom: 32px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    h2::before {
      content: '# ';
      color: #f59e0b;
    }
    
    /* Projects - List style for DevOps */
    .project {
      margin-bottom: 40px;
      padding-left: 24px;
      border-left: 2px solid #e4e4e7;
    }
    
    .project:last-child {
      margin-bottom: 0;
    }
    
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
    }
    
    .project-title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .project-title::before {
      content: '> ';
      color: #f59e0b;
    }
    
    .project-links {
      display: flex;
      gap: 16px;
    }
    
    .project-link {
      color: #ea580c;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .project-link:hover {
      text-decoration: underline;
    }
    
    .project-description {
      color: #52525b;
      line-height: 1.7;
      margin-bottom: 12px;
    }
    
    .project-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .project-tech-tag {
      background: #fef3c7;
      color: #92400e;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* Experience */
    .experience-item {
      margin-bottom: 32px;
      padding-left: 24px;
      border-left: 2px solid #e4e4e7;
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
      font-family: 'JetBrains Mono', monospace;
    }
    
    .experience-role::before {
      content: '$ ';
      color: #22c55e;
    }
    
    .experience-date {
      font-size: 14px;
      color: #71717a;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .experience-org {
      font-size: 16px;
      color: #71717a;
      margin-bottom: 8px;
    }
    
    .experience-description {
      color: #52525b;
      line-height: 1.7;
    }
    
    /* Footer */
    footer {
      padding: 40px 0;
      background: #18181b;
      border-top: 1px solid #27272a;
    }
    
    .social-links {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .social-link {
      color: #a1a1aa;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .social-link:hover {
      color: #fafafa;
    }
    
    .copyright {
      font-size: 13px;
      color: #52525b;
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* Responsive */
    @media (max-width: 640px) {
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
      <p class="terminal-line">$ whoami</p>
      <h1 class="name">${escapeHtml(data.student.name)}</h1>
      <p class="role">${escapeHtml(data.profile.role)}</p>
      <p class="bio">${escapeHtml(data.profile.bio)}</p>
      <div class="tech-stack">
        ${data.profile.tech_stack.map(tech => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}
      </div>
    </div>
  </header>

  <section id="projects">
    <div class="container">
      <h2>Projects</h2>
      ${data.projects.map(project => `
        <article class="project">
          <div class="project-header">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <div class="project-links">
              <a href="${sanitizeUrl(project.github_url)}" class="project-link" target="_blank" rel="noopener">[github]</a>
              ${project.live_url ? `<a href="${sanitizeUrl(project.live_url)}" class="project-link" target="_blank" rel="noopener">[demo]</a>` : ''}
            </div>
          </div>
          <p class="project-description">${escapeHtml(project.description)}</p>
          <div class="project-tech">
            ${project.tech_stack.map(tech => `<span class="project-tech-tag">${escapeHtml(tech)}</span>`).join('')}
          </div>
        </article>
      `).join('')}
    </div>
  </section>

  ${data.experience && data.experience.length > 0 ? `
  <section id="experience">
    <div class="container">
      <h2>Experience</h2>
      ${data.experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <h3 class="experience-role">${escapeHtml(exp.role)}</h3>
            <span class="experience-date">${escapeHtml(formatDateRange(exp.start_date, exp.end_date))}</span>
          </div>
          <p class="experience-org">${escapeHtml(exp.organization)}</p>
          <p class="experience-description">${escapeHtml(exp.description)}</p>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  <footer>
    <div class="container">
      <div class="social-links">
        ${data.socialLinks.github ? `<a href="${sanitizeUrl(data.socialLinks.github)}" class="social-link" target="_blank" rel="noopener">[github]</a>` : ''}
        ${data.socialLinks.linkedin ? `<a href="${sanitizeUrl(data.socialLinks.linkedin)}" class="social-link" target="_blank" rel="noopener">[linkedin]</a>` : ''}
      </div>
      <p class="copyright">// © ${new Date().getFullYear()} ${escapeHtml(data.student.name)} | Built with StackResume</p>
    </div>
  </footer>
</body>
</html>
  `
}

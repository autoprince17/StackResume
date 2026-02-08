import type { PortfolioData } from '@/components/templates/utils'
import type { TemplateType } from '@/components/templates'

export interface ExamplePortfolio {
  slug: string
  name: string
  role: string
  tier: string
  description: string
  preview: string
  templateType: TemplateType
  data: PortfolioData
}

const sarahChen: ExamplePortfolio = {
  slug: 'sarah-chen',
  name: 'Sarah Chen',
  role: 'Developer',
  tier: 'Professional',
  description: 'Full-stack developer with React and Node.js experience',
  preview: 'Clean, minimal design with projects front and center',
  templateType: 'developer',
  data: {
    student: {
      name: 'Sarah Chen',
      subdomain: 'sarahchen',
      custom_domain: null,
    },
    profile: {
      role: 'Full-Stack Developer',
      bio: 'Computer Science student at UC Berkeley passionate about building accessible web applications. I love turning complex problems into simple, elegant interfaces. Currently focused on React, TypeScript, and cloud-native development.',
      tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Tailwind CSS'],
      skills: ['Full-Stack Development', 'System Design', 'API Development', 'CI/CD', 'Agile'],
    },
    projects: [
      {
        title: 'StudySync',
        description: 'A real-time collaborative study platform that matches students by course and learning style. Features live document editing, video chat integration, and smart scheduling. Used by 200+ students at UC Berkeley during the Fall 2025 semester.',
        tech_stack: ['React', 'TypeScript', 'Node.js', 'Socket.io', 'PostgreSQL'],
        github_url: 'https://github.com/sarahchen/studysync',
        live_url: 'https://studysync.app',
      },
      {
        title: 'Pantry Pilot',
        description: 'An AI-powered meal planning app that generates recipes based on available ingredients and dietary preferences. Integrates with grocery delivery APIs to auto-order missing ingredients. Won 2nd place at CalHacks 2025.',
        tech_stack: ['Next.js', 'OpenAI API', 'Prisma', 'Tailwind CSS', 'Vercel'],
        github_url: 'https://github.com/sarahchen/pantry-pilot',
        live_url: 'https://pantrypilot.vercel.app',
      },
      {
        title: 'GitViz',
        description: 'A VS Code extension that visualizes git branch history as an interactive graph. Supports complex merge/rebase visualization with animations. 1.2k installs on the VS Code marketplace.',
        tech_stack: ['TypeScript', 'D3.js', 'VS Code Extension API'],
        github_url: 'https://github.com/sarahchen/gitviz',
        live_url: null,
      },
    ],
    experience: [
      {
        organization: 'Stripe',
        role: 'Software Engineering Intern',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        description: 'Built internal tooling for the Payments team that reduced manual review time by 40%. Implemented a real-time fraud detection dashboard using React and GraphQL that processes 10k+ transactions per minute.',
      },
      {
        organization: 'UC Berkeley EECS Department',
        role: 'Undergraduate Teaching Assistant — CS 61B',
        start_date: '2024-08-01',
        end_date: '2025-05-31',
        description: 'Led weekly discussion sections for 30+ students in Data Structures. Developed autograder test suites for 4 major programming assignments. Held 6 hours of office hours per week.',
      },
    ],
    socialLinks: {
      github: 'https://github.com/sarahchen',
      linkedin: 'https://linkedin.com/in/sarahchen',
    },
    assets: {
      profile_photo_url: null,
    },
  },
}

const marcusJohnson: ExamplePortfolio = {
  slug: 'marcus-johnson',
  name: 'Marcus Johnson',
  role: 'Data Scientist',
  tier: 'Flagship',
  description: 'Machine learning engineer focused on NLP and recommendation systems',
  preview: 'Dark header with card-based project showcases',
  templateType: 'data-scientist',
  data: {
    student: {
      name: 'Marcus Johnson',
      subdomain: 'marcusjohnson',
      custom_domain: null,
    },
    profile: {
      role: 'Data Scientist',
      bio: 'MS Data Science candidate at Georgia Tech specializing in natural language processing and recommendation systems. Published researcher with a focus on making ML models more interpretable and fair. Previously built production ML pipelines at scale.',
      tech_stack: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'SQL', 'Spark', 'Hugging Face', 'MLflow'],
      skills: ['Machine Learning', 'NLP', 'Statistical Modeling', 'Data Engineering', 'A/B Testing'],
    },
    projects: [
      {
        title: 'FairRec',
        description: 'A bias-aware recommendation engine that balances relevance with diversity and fairness metrics. Achieves 94% of baseline NDCG while reducing demographic disparity by 60%. Published at RecSys 2025 workshop.',
        tech_stack: ['Python', 'PyTorch', 'FastAPI', 'Redis', 'Docker'],
        github_url: 'https://github.com/marcusjohnson/fairrec',
        live_url: null,
      },
      {
        title: 'SentimentScope',
        description: 'An aspect-based sentiment analysis tool for product reviews. Fine-tuned a DeBERTa model on 500k annotated reviews achieving 91.3% F1 score. Deployed as a REST API serving 5k requests/day for an e-commerce client.',
        tech_stack: ['Python', 'Hugging Face Transformers', 'FastAPI', 'PostgreSQL', 'AWS SageMaker'],
        github_url: 'https://github.com/marcusjohnson/sentimentscope',
        live_url: 'https://sentimentscope.demo.app',
      },
      {
        title: 'ATL Transit Predictor',
        description: 'A real-time transit delay prediction system for Atlanta MARTA. Combined weather, historical, and event data to predict delays with 87% accuracy within a 5-minute window. Uses streaming data pipeline with Apache Kafka.',
        tech_stack: ['Python', 'Spark', 'Kafka', 'XGBoost', 'Streamlit'],
        github_url: 'https://github.com/marcusjohnson/atl-transit',
        live_url: 'https://atl-transit.streamlit.app',
      },
      {
        title: 'Clinical Notes NER',
        description: 'Named entity recognition system for extracting medical entities from clinical notes. Trained on i2b2 dataset with custom BiLSTM-CRF architecture. Achieves 88.7% entity-level F1 on medication and diagnosis extraction.',
        tech_stack: ['Python', 'PyTorch', 'spaCy', 'Weights & Biases'],
        github_url: 'https://github.com/marcusjohnson/clinical-ner',
        live_url: null,
      },
    ],
    experience: [
      {
        organization: 'Netflix',
        role: 'Machine Learning Engineering Intern',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        description: 'Developed and deployed an improved content similarity model for the recommendation system. Reduced cold-start user churn by 8% through better initial recommendations. Ran A/B tests across 2M+ users.',
      },
      {
        organization: 'Georgia Tech ML Lab',
        role: 'Graduate Research Assistant',
        start_date: '2024-08-01',
        end_date: null,
        description: 'Researching fairness-aware ranking algorithms under Dr. Priya Patel. Contributing to open-source fairness toolkit. Co-authored paper accepted at RecSys 2025 workshop on bias mitigation in collaborative filtering.',
      },
      {
        organization: 'Home Depot (Corporate)',
        role: 'Data Science Co-op',
        start_date: '2024-01-01',
        end_date: '2024-05-31',
        description: 'Built demand forecasting models for 2,000+ SKUs using time-series analysis. Automated weekly reporting pipeline that saved the merchandising team 15 hours per week. Presented findings to VP of Analytics.',
      },
    ],
    socialLinks: {
      github: 'https://github.com/marcusjohnson',
      linkedin: 'https://linkedin.com/in/marcusjohnson',
    },
    assets: {
      profile_photo_url: null,
    },
  },
}

const emilyRodriguez: ExamplePortfolio = {
  slug: 'emily-rodriguez',
  name: 'Emily Rodriguez',
  role: 'DevOps',
  tier: 'Professional',
  description: 'Cloud infrastructure specialist with AWS and Kubernetes expertise',
  preview: 'Terminal-inspired aesthetic with monospace fonts',
  templateType: 'devops',
  data: {
    student: {
      name: 'Emily Rodriguez',
      subdomain: 'emilyrodriguez',
      custom_domain: null,
    },
    profile: {
      role: 'DevOps Engineer',
      bio: 'Systems Engineering student at CMU with a passion for building reliable, scalable infrastructure. I believe great DevOps is invisible — when everything just works. Certified AWS Solutions Architect with hands-on experience in Kubernetes and infrastructure-as-code.',
      tech_stack: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'GitHub Actions', 'Prometheus', 'Grafana', 'Linux'],
      skills: ['Cloud Architecture', 'CI/CD', 'Infrastructure as Code', 'Monitoring', 'Security'],
    },
    projects: [
      {
        title: 'deploy-fast',
        description: 'An opinionated CLI tool for bootstrapping production-ready Kubernetes deployments on AWS EKS. Handles VPC setup, node group configuration, Helm chart deployment, and monitoring stack in a single command. 340+ GitHub stars.',
        tech_stack: ['Go', 'AWS CDK', 'Kubernetes', 'Helm', 'Terraform'],
        github_url: 'https://github.com/emilyrodriguez/deploy-fast',
        live_url: null,
      },
      {
        title: 'infra-audit',
        description: 'A Terraform compliance scanner that checks IaC templates against CIS benchmarks and custom organizational policies. Integrates with GitHub Actions for PR-level feedback. Catches 95% of common misconfigurations before they reach production.',
        tech_stack: ['Python', 'Terraform', 'GitHub Actions', 'Open Policy Agent'],
        github_url: 'https://github.com/emilyrodriguez/infra-audit',
        live_url: null,
      },
      {
        title: 'uptime-dashboard',
        description: 'A self-hosted status page and incident management tool built for small teams. Features real-time health checks, PagerDuty integration, and automated incident timelines. Monitors 50+ services across 3 campus organizations.',
        tech_stack: ['TypeScript', 'Next.js', 'Prometheus', 'Grafana', 'Docker Compose'],
        github_url: 'https://github.com/emilyrodriguez/uptime-dashboard',
        live_url: 'https://status.cmu-techclub.org',
      },
    ],
    experience: [
      {
        organization: 'Cloudflare',
        role: 'Infrastructure Engineering Intern',
        start_date: '2025-05-01',
        end_date: '2025-08-31',
        description: 'Designed and implemented automated canary deployment pipeline for edge workers. Reduced deployment rollback time from 15 minutes to under 2 minutes. Built custom Prometheus exporters for monitoring deployment health across 300+ data centers.',
      },
      {
        organization: 'CMU School of Computer Science',
        role: 'Systems Administrator',
        start_date: '2024-01-01',
        end_date: null,
        description: 'Manage compute infrastructure for 3 research labs serving 100+ graduate students. Migrated legacy VM-based workloads to containerized deployments on Kubernetes, reducing provisioning time from days to minutes.',
      },
    ],
    socialLinks: {
      github: 'https://github.com/emilyrodriguez',
      linkedin: 'https://linkedin.com/in/emilyrodriguez',
    },
    assets: {
      profile_photo_url: null,
    },
  },
}

export const examplePortfolios: ExamplePortfolio[] = [
  sarahChen,
  marcusJohnson,
  emilyRodriguez,
]

export function getExampleBySlug(slug: string): ExamplePortfolio | undefined {
  return examplePortfolios.find((p) => p.slug === slug)
}

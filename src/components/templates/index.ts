import { PortfolioData } from './utils'
import { DeveloperTemplate } from './developer/DeveloperTemplate'
import { DataScientistTemplate } from './data-scientist/DataScientistTemplate'
import { DevOpsTemplate } from './devops/DevOpsTemplate'

export type TemplateType = 'developer' | 'data-scientist' | 'devops'

export function selectTemplate(role: string): TemplateType {
  switch (role) {
    case 'Data Scientist':
      return 'data-scientist'
    case 'DevOps':
      return 'devops'
    case 'Developer':
    default:
      return 'developer'
  }
}

export function generatePortfolioHTML(
  template: TemplateType,
  data: PortfolioData
): string {
  switch (template) {
    case 'data-scientist':
      return DataScientistTemplate({ data })
    case 'devops':
      return DevOpsTemplate({ data })
    case 'developer':
    default:
      return DeveloperTemplate({ data })
  }
}

export function getTemplateName(template: TemplateType): string {
  switch (template) {
    case 'data-scientist':
      return 'Data Scientist'
    case 'devops':
      return 'DevOps'
    case 'developer':
      return 'Developer'
    default:
      return 'Developer'
  }
}

import { ContentSection } from '../components/content-section'
import { SecurityForm } from './security-form'

export function SettingsSecurity() {
  return (
    <ContentSection
      title='安全'
      desc='修改您的登录密码。修改成功后我们会向您的邮箱发送通知。'
    >
      <SecurityForm />
    </ContentSection>
  )
}

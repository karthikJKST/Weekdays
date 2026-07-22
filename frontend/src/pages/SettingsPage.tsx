import { User, Bell, Shield, Palette, ChevronRight } from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'

const sections = [
  { label: 'Profile', description: 'Name, email, and avatar', icon: User },
  { label: 'Notifications', description: 'Email and push notification preferences', icon: Bell },
  { label: 'Security', description: 'Password, 2FA, and sessions', icon: Shield },
  { label: 'Appearance', description: 'Theme and layout preferences', icon: Palette },
]

export function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      description="Manage your account and application preferences."
    >
      <Card padding="sm">
        <div className="divide-y divide-slate-800/60">
          {sections.map(({ label, description, icon: Icon }) => (
            <button
              key={label}
              className="flex w-full items-center gap-4 px-3 py-4 text-left transition hover:bg-slate-800/20 first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-800/60 text-slate-400">
                <Icon size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          ))}
        </div>
      </Card>
    </PageContainer>
  )
}

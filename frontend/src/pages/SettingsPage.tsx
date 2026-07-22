import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Palette,
  SlidersHorizontal,
  Camera,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Smartphone,
  Key,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { PageContainer } from '../components/ui/PageContainer'
import { Card } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences'
type Theme = 'dark' | 'light' | 'system'
type Density = 'comfortable' | 'compact' | 'cozy'

interface ToggleProps {
  label: string
  description: string
  defaultChecked?: boolean
}

function Toggle({ label, description, defaultChecked = false }: ToggleProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-[#0b0f19] ${
          checked ? 'bg-indigo-500' : 'bg-slate-700/50'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description: string; icon: React.FC<{ size?: number; className?: string }> }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map(({ value: v, label, description, icon: Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
            value === v
              ? 'border-indigo-500/40 bg-indigo-500/10'
              : 'border-slate-800/60 bg-[#0e1421] hover:border-slate-700/60'
          }`}
        >
          <Icon size={22} className={value === v ? 'text-indigo-400' : 'text-slate-500'} />
          <div>
            <p className={`text-sm font-medium ${value === v ? 'text-indigo-200' : 'text-slate-300'}`}>{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

const TABS: { key: SettingsTab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
]

export function SettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [theme, setTheme] = useState<Theme>('dark')
  const [density, setDensity] = useState<Density>('comfortable')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  function handleSave() {
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  return (
    <PageContainer
      title="Settings"
      description="Manage your account and application preferences."
    >
      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-800/60 bg-[#121827] p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === key
                ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <Card padding="md">
          <div className="mb-6 flex items-center gap-5">
            <div className="relative group">
              <div className="grid size-20 place-items-center rounded-2xl bg-indigo-500/15 text-2xl font-semibold text-indigo-300">
                {user?.fullName?.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) ?? 'WD'}
              </div>
              <button className="absolute inset-0 grid place-items-center rounded-2xl bg-black/50 opacity-0 transition group-hover:opacity-100">
                <Camera size={18} className="text-white" />
              </button>
            </div>
            <div>
              <p className="text-lg font-medium text-white">{user?.fullName ?? 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email ?? 'user@weekdays.dev'}</p>
              <span className="mt-1 inline-block rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
                {user?.role ?? 'Member'}
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300">Full name</label>
              <input
                type="text"
                defaultValue={user?.fullName ?? ''}
                className="mt-1.5 w-full rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <input
                type="email"
                defaultValue={user?.email ?? ''}
                className="mt-1.5 w-full rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50"
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-5">
              <div className="flex items-center gap-2">
                {saved && <CheckCircle2 size={16} className="text-emerald-400" />}
                <p className="text-xs text-slate-500">{saved ? 'Saved successfully' : 'Changes are saved automatically'}</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <Card padding="md">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <Bell size={18} className="text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Notification preferences</p>
              <p className="text-xs text-slate-500">Control how you receive updates.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/40">
            <Toggle label="Email notifications" description="Receive updates via email" defaultChecked />
            <Toggle label="Push notifications" description="Desktop and mobile push alerts" defaultChecked />
            <Toggle label="Weekly summary" description="Get a weekly digest of your activity" defaultChecked />
            <Toggle label="Task assignments" description="Notify when you're assigned a task" defaultChecked />
            <Toggle label="Project updates" description="Changes to projects you're part of" defaultChecked />
            <Toggle label="Mention notifications" description="When someone mentions you in comments" defaultChecked />
            <Toggle label="Marketing emails" description="Product updates and tips" />
          </div>

          <div className="mt-5 flex justify-end border-t border-slate-800/60 pt-5">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              <Save size={15} />
              Save preferences
            </button>
          </div>
        </Card>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          <Card padding="md">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <Key size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Change password</p>
                <p className="text-xs text-slate-500">Update your account password.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Current password</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">New password</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Confirm new password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50"
                />
              </div>
              <div className="flex justify-end">
                <button className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400">
                  Update password
                </button>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center gap-3">
              <Smartphone size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Two-factor authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security.</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3">
              <div>
                <p className="text-sm text-slate-300">Authenticator app</p>
                <p className="text-xs text-slate-500">Use an app to generate one-time codes</p>
              </div>
              <button className="rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600 hover:text-slate-300">
                Set up
              </button>
            </div>
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center gap-3">
              <LogOut size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Active sessions</p>
                <p className="text-xs text-slate-500">Manage your active login sessions.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-[#0e1421] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-sm text-slate-300">Current session</p>
                    <p className="text-xs text-slate-500">Windows · Chrome · Active now</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600">This device</span>
              </div>
              <button className="w-full rounded-lg border border-rose-800/30 bg-rose-500/5 px-4 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10">
                Sign out all other sessions
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Appearance */}
      {activeTab === 'appearance' && (
        <Card padding="md">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <Palette size={18} className="text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Appearance</p>
              <p className="text-xs text-slate-500">Customize how WeekDays looks.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">Theme</p>
              <RadioGroup
                options={[
                  { value: 'dark' as Theme, label: 'Dark', description: 'Dark theme', icon: Moon },
                  { value: 'light' as Theme, label: 'Light', description: 'Light theme', icon: Sun },
                  { value: 'system' as Theme, label: 'System', description: 'Follow system', icon: Monitor },
                ]}
                value={theme}
                onChange={setTheme}
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">Density</p>
              <RadioGroup
                options={[
                  { value: 'comfortable' as Density, label: 'Comfortable', description: 'More padding', icon: Monitor },
                  { value: 'compact' as Density, label: 'Compact', description: 'Less padding', icon: Monitor },
                  { value: 'cozy' as Density, label: 'Cozy', description: 'Balanced', icon: Monitor },
                ]}
                value={density}
                onChange={setDensity}
              />
            </div>

            <div className="flex justify-end border-t border-slate-800/60 pt-5">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                <Save size={15} />
                Save preferences
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <Card padding="md">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <SlidersHorizontal size={18} className="text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Preferences</p>
              <p className="text-xs text-slate-500">Regional and application preferences.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300">Date format</label>
              <select className="mt-1.5 w-full appearance-none rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Time zone</label>
              <select className="mt-1.5 w-full appearance-none rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50">
                <option>UTC (Coordinated Universal Time)</option>
                <option>America/New_York (EST)</option>
                <option>America/Chicago (CST)</option>
                <option>America/Denver (MST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
                <option>Europe/Berlin (CET)</option>
                <option>Asia/Tokyo (JST)</option>
                <option>Asia/Kolkata (IST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Language</label>
              <select className="mt-1.5 w-full appearance-none rounded-xl border border-slate-800/60 bg-[#0e1421] px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-slate-700/80 focus:ring-1 focus:ring-slate-700/50">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Japanese</option>
              </select>
            </div>
            <div className="flex justify-end border-t border-slate-800/60 pt-5">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                <Save size={15} />
                Save preferences
              </button>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  )
}

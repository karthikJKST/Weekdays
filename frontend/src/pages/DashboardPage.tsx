import { ArrowRight, Sparkles, LayoutDashboard, CalendarDays, Activity } from 'lucide-react'

const foundations = [
  { icon: LayoutDashboard, title: 'Application shell', detail: 'Dark-first workspace and protected routing.' },
  { icon: CalendarDays, title: 'Execution workflows', detail: 'Projects, tasks, calendar, and timelines.' },
  { icon: Activity, title: 'Engineering insights', detail: 'Team health, sprint metrics, and activity history.' },
]

export function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-10">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            <Sparkles size={15} /> Foundation initialized
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Engineering work, <span className="text-indigo-300">executed better.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            WeekDays is the engineering execution platform for projects, sprints, releases, and the teams that ship them.
          </p>
          <button className="mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400">
            Start building <ArrowRight size={17} />
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-[#121827] p-5 shadow-2xl shadow-black/30">
          <div className="mb-5 flex items-center justify-between">
            <span className="font-medium text-slate-200">WeekDays foundation</span>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Ready</span>
          </div>
          <div className="space-y-3">
            {foundations.map(({ icon: Icon, title, detail }) => (
              <article key={title} className="flex gap-4 rounded-2xl border border-slate-800 bg-[#0e1421] p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300">
                  <Icon size={19} />
                </span>
                <div>
                  <h2 className="font-medium text-slate-100">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

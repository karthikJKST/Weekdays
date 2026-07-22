import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderKanban, ListTodo, Calendar, X } from 'lucide-react'
import { useProjects } from '../../api/projects'
import { useTasks } from '../../api/tasks'
import { useCalendar } from '../../api/calendar'

interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: 'project' | 'task' | 'event'
  icon: React.FC<{ size?: number; className?: string }>
  color: string
  url: string
}

export function SearchBar() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const { data: projects = [] } = useProjects()
  const { data: tasks = [] } = useTasks()
  const { data: events = [] } = useCalendar()

  // Listen for ⌘K / Ctrl+K to focus search, and Ctrl+F / Cmd+F
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if ((e.key === 'k' && isCmdOrCtrl) || (e.key === 'f' && isCmdOrCtrl)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const results = useMemo(() => {
    if (query.length < 1) return []
    const q = query.toLowerCase()

    const projectResults: SearchResult[] = projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.description,
        type: 'project' as const,
        icon: FolderKanban,
        color: 'text-indigo-400',
        url: '/projects',
      }))

    const taskResults: SearchResult[] = tasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: t.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        type: 'task' as const,
        icon: ListTodo,
        color: 'text-amber-400',
        url: '/tasks',
      }))

    const eventResults: SearchResult[] = events
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        title: e.title,
        subtitle: e.type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        type: 'event' as const,
        icon: Calendar,
        color: 'text-sky-400',
        url: '/calendar',
      }))

    return [...projectResults, ...taskResults, ...eventResults].slice(0, 10)
  }, [query, projects, tasks, events])

  function handleSelect(url: string) {
    setIsOpen(false)
    setQuery('')
    navigate(url)
  }

  function handleInputChange(value: string) {
    setQuery(value)
    setIsOpen(value.length >= 1)
  }

  return (
    <div ref={panelRef} className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => query.length >= 1 && setIsOpen(true)}
        placeholder="Search anything…"
        aria-label="Search projects, tasks, and events"
        className="w-64 rounded-xl border border-slate-800/60 bg-[#121827] py-2 pl-9 pr-8 text-sm text-slate-300 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-700/80 focus:bg-[#161e2e] focus:ring-1 focus:ring-slate-700/50 lg:w-80"
      />
      {query ? (
        <button
          onClick={() => { setQuery(''); setIsOpen(false) }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
        >
          <X size={14} />
        </button>
      ) : null}
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-slate-500 lg:inline-block">
        ⌘K
      </kbd>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-800/60 bg-[#121827] p-2 shadow-2xl shadow-black/40">
          {results.length > 0 ? (
            <div className="space-y-0.5">
              {results.map((result) => {
                const Icon = result.icon
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.url)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-800/50"
                  >
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg bg-slate-800/60 ${result.color}`}>
                      <Icon size={15} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">{result.title}</p>
                      <p className="truncate text-xs text-slate-500">{result.subtitle}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {result.type}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Search size={24} className="text-slate-700" />
              <p className="text-sm text-slate-500">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-600">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

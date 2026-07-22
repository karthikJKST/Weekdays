import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for ⌘K / Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      if (e.key === 'k' && isCmdOrCtrl) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search anything…"
        className="w-64 rounded-xl border border-slate-800/60 bg-[#121827] py-2 pl-9 pr-3 text-sm text-slate-300 placeholder-slate-600 caret-indigo-400 outline-none transition focus:border-slate-700/80 focus:bg-[#161e2e] focus:ring-1 focus:ring-slate-700/50 lg:w-80"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-800 bg-slate-800/50 px-1.5 py-0.5 text-[11px] font-medium tracking-wide text-slate-500 lg:inline-block">
        ⌘K
      </kbd>
    </div>
  )
}

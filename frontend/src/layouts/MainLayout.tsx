import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Navbar } from '../components/layout/Navbar'

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f19]">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

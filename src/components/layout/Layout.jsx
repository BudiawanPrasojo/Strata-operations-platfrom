import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      {/* On mobile (< lg): sidebar overlays content, no margin needed.
          On desktop (>= lg): margin-left shifts content away from sidebar. */}
      <div className="layout-main" style={{ '--sidebar-w': sidebarCollapsed ? '52px' : '216px' }}>
        <TopNavbar onMenuToggle={toggleSidebar} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

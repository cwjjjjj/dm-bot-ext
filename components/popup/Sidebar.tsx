/**
 * Sidebar Navigation Component
 * Provides navigation between different pages
 */

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: Page) => void;
}

export type Page = 'home' | 'quick-dm' | 'lists' | 'templates' | 'logs' | 'settings';

const menuItems = [
  { id: 'home' as Page, label: 'Dashboard', icon: '🏠' },
  { id: 'quick-dm' as Page, label: 'Quick DM', icon: '⚡' },
  { id: 'lists' as Page, label: 'Contact Lists', icon: '📋' },
  { id: 'templates' as Page, label: 'Templates', icon: '📝' },
  { id: 'logs' as Page, label: 'Activity Logs', icon: '📊' },
  { id: 'settings' as Page, label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside
      style={{
        width: '220px',
        height: '100%',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #dbdbdb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #dbdbdb',
        }}
      >
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            color: '#1a1a1a',
          }}
        >
          DM Bot
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#666',
            margin: '4px 0 0',
          }}
        >
          Instagram Automation
        </p>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto',
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '4px',
              border: 'none',
              background: currentPage === item.id ? '#0095f6' : 'transparent',
              color: currentPage === item.id ? 'white' : '#333',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: currentPage === item.id ? 600 : 400,
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = '#e8e8e8';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #dbdbdb',
          fontSize: '11px',
          color: '#999',
        }}
      >
        Version 1.0.0
      </div>
    </aside>
  );
}

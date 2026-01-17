/**
 * Home Page - Dashboard
 * Shows today's progress, active queue, and quick actions
 */

import { useEffect, useState } from 'react';
import { useActiveQueue, useSettings } from '~/lib/storage-hooks';
import type { Page } from './Sidebar';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [queueData] = useActiveQueue();
  const [settingsData] = useSettings();
  const [todayProgress, setTodayProgress] = useState(0);

  useEffect(() => {
    if (settingsData) {
      setTodayProgress((settingsData.todaySentCount / settingsData.dailyLimit) * 100);
    }
  }, [settingsData]);

  const queue = queueData;
  const settings = settingsData;

  const handlePauseQueue = async () => {
    const response = await browser.runtime.sendMessage({ type: 'PAUSE_QUEUE' });
    if (!response.success) {
      alert('Failed to pause queue: ' + response.error);
    }
  };

  const handleResumeQueue = async () => {
    const response = await browser.runtime.sendMessage({ type: 'RESUME_QUEUE' });
    if (!response.success) {
      alert('Failed to resume queue: ' + response.error);
    }
  };

  const handleStopQueue = async () => {
    if (confirm('Are you sure you want to stop the queue?')) {
      const response = await browser.runtime.sendMessage({ type: 'STOP_QUEUE' });
      if (!response.success) {
        alert('Failed to stop queue: ' + response.error);
      }
    }
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 24px',
          color: '#1a1a1a',
        }}
      >
        Dashboard
      </h2>

      {/* Today's Progress */}
      <section
        style={{
          backgroundColor: '#f8f8f8',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#333',
          }}
        >
          Today's Progress
        </h3>
        <div style={{ marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#0095f6',
            }}
          >
            {settings?.todaySentCount || 0}
          </span>
          <span
            style={{
              fontSize: '16px',
              color: '#666',
              marginLeft: '8px',
            }}
          >
            / {settings?.dailyLimit || 30} DMs
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#e0e0e0',
            borderRadius: '5px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(todayProgress, 100)}%`,
              height: '100%',
              backgroundColor: todayProgress >= 100 ? '#ed4956' : '#0095f6',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </section>

      {/* Active Queue */}
      {queue ? (
        <section
          style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 16px',
              color: '#333',
            }}
          >
            Active Queue
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Queue Name
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#1a1a1a',
              }}
            >
              {queue.name}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Status
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor:
                  queue.status === 'running'
                    ? '#c8e6c9'
                    : queue.status === 'paused'
                      ? '#fff9c4'
                      : '#f5f5f5',
                color:
                  queue.status === 'running'
                    ? '#2e7d32'
                    : queue.status === 'paused'
                      ? '#f57f17'
                      : '#666',
              }}
            >
              {queue.status.toUpperCase()}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '13px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              Progress
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#1a1a1a',
              }}
            >
              {queue.completedTasks} / {queue.totalTasks} tasks
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(queue.completedTasks / queue.totalTasks) * 100}%`,
                  height: '100%',
                  backgroundColor: '#0095f6',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          {queue.failedTasks > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '4px',
                }}
              >
                Failed
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ed4956',
                }}
              >
                {queue.failedTasks}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            {queue.status === 'running' && (
              <button
                onClick={handlePauseQueue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5a623',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Pause
              </button>
            )}
            {queue.status === 'paused' && (
              <button
                onClick={handleResumeQueue}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0095f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Resume
              </button>
            )}
            <button
              onClick={handleStopQueue}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ed4956',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Stop
            </button>
          </div>
        </section>
      ) : (
        <section
          style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '40px 24px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 20px',
            }}
          >
            No active automation queue
          </p>
          <button
            onClick={() => onNavigate('lists')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0095f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Start New Queue
          </button>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#333',
          }}
        >
          Quick Actions
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          <QuickActionCard
            icon="⚡"
            title="Quick DM"
            description="Send single DM now"
            onClick={() => onNavigate('quick-dm')}
          />
          <QuickActionCard
            icon="📋"
            title="Contact Lists"
            description="Import and manage contacts"
            onClick={() => onNavigate('lists')}
          />
          <QuickActionCard
            icon="📝"
            title="Templates"
            description="Create message templates"
            onClick={() => onNavigate('templates')}
          />
          <QuickActionCard
            icon="📊"
            title="Activity Logs"
            description="View automation history"
            onClick={() => onNavigate('logs')}
          />
          <QuickActionCard
            icon="⚙️"
            title="Settings"
            description="Configure automation"
            onClick={() => onNavigate('settings')}
          />
        </div>
      </section>
    </div>
  );
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '20px',
        backgroundColor: '#f8f8f8',
        border: '1px solid #dbdbdb',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#0095f6';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#dbdbdb';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <div
        style={{
          fontSize: '15px',
          fontWeight: 600,
          marginBottom: '4px',
          color: '#1a1a1a',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: '#666',
        }}
      >
        {description}
      </div>
    </button>
  );
}

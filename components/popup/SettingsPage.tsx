/**
 * Settings Page - Extension Configuration
 * Rate limiting, typing simulation, error handling, notifications
 */

import { useSettings } from '~/lib/storage-hooks';
import { storageOps } from '~/lib/storage';

export default function SettingsPage() {
  const [settingsData] = useSettings();
  const settings = settingsData;

  const handleUpdateSettings = async (updates: Partial<typeof settings>) => {
    if (settings) {
      const updated = { ...settings, ...updates };
      await storageOps.setSettings(updated);
    }
  };

  const handleResetDailyCount = async () => {
    if (!confirm('Are you sure you want to reset the daily count?')) return;
    await storageOps.resetDailyCount();
  };

  if (!settings) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
        Loading settings...
      </div>
    );
  }

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
        Settings
      </h2>

      {/* Rate Limiting */}
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
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px',
            color: '#333',
          }}
        >
          Rate Limiting
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Daily DM Limit
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.dailyLimit}
              onChange={(e) =>
                handleUpdateSettings({ dailyLimit: parseInt(e.target.value) || 30 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>DMs per day</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Today's Progress
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 600 }}>
              {settings.todaySentCount} / {settings.dailyLimit} sent
            </span>
            <button
              onClick={handleResetDailyCount}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #dbdbdb',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
            >
              Reset
            </button>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                width: `${(settings.todaySentCount / settings.dailyLimit) * 100}%`,
                height: '100%',
                backgroundColor:
                  settings.todaySentCount >= settings.dailyLimit ? '#ed4956' : '#0095f6',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Min Delay Between Messages
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.minDelay}
              onChange={(e) =>
                handleUpdateSettings({ minDelay: parseInt(e.target.value) || 60 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>seconds</span>
          </div>
        </div>

        <div style={{ marginBottom: '0' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Max Delay Between Messages
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.maxDelay}
              onChange={(e) =>
                handleUpdateSettings({ maxDelay: parseInt(e.target.value) || 300 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>seconds</span>
          </div>
        </div>
      </section>

      {/* Typing Simulation */}
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
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px',
            color: '#333',
          }}
        >
          Typing Simulation
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Min Typing Speed
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.typingSpeedMin}
              onChange={(e) =>
                handleUpdateSettings({ typingSpeedMin: parseInt(e.target.value) || 50 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>milliseconds per character</span>
          </div>
        </div>

        <div style={{ marginBottom: '0' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Max Typing Speed
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.typingSpeedMax}
              onChange={(e) =>
                handleUpdateSettings({ typingSpeedMax: parseInt(e.target.value) || 250 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>milliseconds per character</span>
          </div>
        </div>
      </section>

      {/* Error Handling */}
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
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px',
            color: '#333',
          }}
        >
          Error Handling
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={settings.pauseOnError}
              onChange={(e) => handleUpdateSettings({ pauseOnError: e.target.checked })}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '10px',
                cursor: 'pointer',
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                Pause on error
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Stop automation when an error occurs
              </div>
            </div>
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={settings.autoRetry}
              onChange={(e) => handleUpdateSettings({ autoRetry: e.target.checked })}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '10px',
                cursor: 'pointer',
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
                Auto-retry failed messages
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                Automatically retry sending failed messages
              </div>
            </div>
          </label>
        </div>

        <div style={{ marginBottom: '0' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Max Retries
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              value={settings.maxRetries}
              onChange={(e) =>
                handleUpdateSettings({ maxRetries: parseInt(e.target.value) || 3 })
              }
              style={{
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                width: '120px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
            />
            <span style={{ fontSize: '13px', color: '#666' }}>retry attempts</span>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section
        style={{
          backgroundColor: '#f8f8f8',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px',
            color: '#333',
          }}
        >
          Notifications
        </h3>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={settings.enableNotifications}
            onChange={(e) =>
              handleUpdateSettings({ enableNotifications: e.target.checked })
            }
            style={{
              width: '18px',
              height: '18px',
              marginRight: '10px',
              cursor: 'pointer',
            }}
          />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
              Enable notifications
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              Show browser notifications when queue completes
            </div>
          </div>
        </label>
      </section>
    </div>
  );
}

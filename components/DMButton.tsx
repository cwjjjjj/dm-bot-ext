import { useState } from 'react';
import { navigateToDM, extractProfileInfo } from '~/lib/instagram-dom';

export default function DMButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(() => extractProfileInfo());

  const handleDMClick = () => {
    if (profile.username) {
      navigateToDM(profile.username);
    }
  };

  const handleQuickMessage = (message: string) => {
    if (profile.username) {
      // For now, just navigate to DM
      // In future, we could pre-fill the message
      navigateToDM(profile.username);
    }
    setIsOpen(false);
  };

  return (
    <div className="dm-bot-wrapper">
      <button
        onClick={handleDMClick}
        className="dm-bot-button"
        style={{
          backgroundColor: '#0095f6',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        Quick DM
      </button>

      {isOpen && (
        <div
          className="dm-bot-modal"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '16px',
            minWidth: '280px',
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>
            Quick Messages
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleQuickMessage('Hi! I love your content!')}
              style={{
                padding: '8px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Hi! I love your content! 👋
            </button>
            <button
              onClick={() => handleQuickMessage('Let\'s collaborate!')}
              style={{
                padding: '8px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Let's collaborate! 🤝
            </button>
          </div>
        </button>
      )}
    </div>
  );
}

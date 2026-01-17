/**
 * Quick DM Page - Send single DM without CSV
 * Paste Instagram link and send message directly
 */

import { useState, useEffect } from 'react';
import { useTemplates } from '~/lib/storage-hooks';
import { normalizeProfileLink } from '~/lib/csv-parser';
import { parseMessage, previewMessage } from '~/lib/spintex';

interface QuickDMPageProps {
  onNavigate: (page: string) => void;
}

export default function QuickDMPage({ onNavigate }: QuickDMPageProps) {
  const [templates] = useTemplates();
  const [link, setLink] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [preview, setPreview] = useState('');
  const [validation, setValidation] = useState<{
    linkValid: boolean;
    linkError?: string;
  }>({ linkValid: false });

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

  // Update preview when template or link changes
  useEffect(() => {
    if (useCustomMessage) {
      setPreview(customMessage);
    } else if (selectedTemplate) {
      setPreview(previewMessage(selectedTemplate.content, { Name: 'User', Category: 'General' }));
    } else {
      setPreview('');
    }
  }, [selectedTemplate, customMessage, useCustomMessage]);

  const handleLinkChange = (value: string) => {
    setLink(value);
    setValidation({ linkValid: false });

    if (!value.trim()) {
      return;
    }

    try {
      const normalized = normalizeProfileLink(value);
      setValidation({ linkValid: true });
    } catch (error) {
      setValidation({
        linkValid: false,
        linkError: (error as Error).message,
      });
    }
  };

  const handleSend = async () => {
    if (!validation.linkValid) {
      alert('Please enter a valid Instagram profile link');
      return;
    }

    if (!useCustomMessage && !selectedTemplate) {
      alert('Please select a message template or use custom message');
      return;
    }

    if (useCustomMessage && !customMessage.trim()) {
      alert('Please enter a custom message');
      return;
    }

    setIsSending(true);

    try {
      const normalized = normalizeProfileLink(link);
      const message = useCustomMessage ? customMessage : selectedTemplate!.content;

      // Send to background script
      const response = await browser.runtime.sendMessage({
        type: 'SEND_SINGLE_DM',
        username: normalized.username,
        message,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to send DM');
      }

      // Show success message
      alert('DM sent successfully! ✅');

      // Reset form
      setLink('');
      setCustomMessage('');
      setSelectedTemplateId('');
      setValidation({ linkValid: false });
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <h2
        style={{
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 8px',
          color: '#1a1a1a',
        }}
      >
        Quick DM
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#666',
          margin: '0 0 32px',
        }}
      >
        Send a single DM without importing a CSV list
      </p>

      <div
        style={{
          maxWidth: '600px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        {/* Profile Link Input */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: '#333',
            }}
          >
            Instagram Profile Link
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => handleLinkChange(e.target.value)}
            placeholder="@username or https://www.instagram.com/username/"
            disabled={isSending}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${validation.linkError ? '#ed4956' : '#dbdbdb'}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: isSending ? '#f5f5f5' : 'white',
            }}
            onFocus={(e) => {
              if (!isSending) e.currentTarget.style.borderColor = '#0095f6';
            }}
            onBlur={(e) => {
              if (!isSending) e.currentTarget.style.borderColor = '#dbdbdb';
            }}
          />
          {validation.linkError && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#ed4956',
              }}
            >
              ⚠️ {validation.linkError}
            </div>
          )}
          {validation.linkValid && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#2e7d32',
              }}
            >
              ✓ Valid profile: @{normalizeProfileLink(link).username}
            </div>
          )}
        </div>

        {/* Message Selection */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '12px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#333',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                checked={!useCustomMessage}
                onChange={() => setUseCustomMessage(false)}
                disabled={isSending}
                style={{ marginRight: '6px' }}
              />
              Use Template
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#333',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                checked={useCustomMessage}
                onChange={() => setUseCustomMessage(true)}
                disabled={isSending}
                style={{ marginRight: '6px' }}
              />
              Custom Message
            </label>
          </div>

          {!useCustomMessage ? (
            <div>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                disabled={isSending}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #dbdbdb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: isSending ? '#f5f5f5' : 'white',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">Select a template...</option>
                {templates?.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {!templates || templates.length === 0 ? (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  No templates available.{' '}
                  <button
                    onClick={() => onNavigate('templates')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0095f6',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    Create one
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              disabled={isSending}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                backgroundColor: isSending ? '#f5f5f5' : 'white',
              }}
            />
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '6px',
                color: '#333',
              }}
            >
              Message Preview
            </label>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                border: '1px solid #dbdbdb',
                minHeight: '60px',
              }}
            >
              {preview}
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!validation.linkValid || isSending}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor:
              validation.linkValid && !isSending ? '#0095f6' : '#bdbdbd',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: validation.linkValid && !isSending ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            if (validation.linkValid && !isSending) {
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isSending ? 'Sending...' : 'Send DM 🚀'}
        </button>

        {/* Help Text */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff9c4',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#856404',
          }}
        >
          <strong>💡 Tip:</strong> The DM will be sent with human-like typing
          simulation and random delays to avoid detection.
        </div>
      </div>
    </div>
  );
}

/**
 * Templates Page - Message Template Editor
 * Create and edit message templates with variable substitution and Spintex support
 */

import { useState, useEffect } from 'react';
import { useTemplates } from '~/lib/storage-hooks';
import { storageOps } from '~/lib/storage';
import { parseMessage, validateSpintex, previewMessage } from '~/lib/spintex';
import { v4 as uuidv4 } from 'uuid';
import type { MessageTemplate } from '~/types/storage';

export default function TemplatesPage() {
  const [templates] = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', content: '' });
  const [previewVariables] = useState({
    Name: 'John',
    Category: 'Fashion',
  });
  const [spintexValidation, setSpintexValidation] = useState<{
    valid: boolean;
    error?: string;
  }>({ valid: true });

  useEffect(() => {
    if (selectedTemplate && !isEditing) {
      setEditForm({
        name: selectedTemplate.name,
        content: selectedTemplate.content,
      });
      setSpintexValidation(validateSpintex(selectedTemplate.content));
    }
  }, [selectedTemplate, isEditing]);

  const handleCreateTemplate = () => {
    const newTemplate: MessageTemplate = {
      id: uuidv4(),
      name: 'New Template',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSelectedTemplate(newTemplate);
    setEditForm({ name: 'New Template', content: '' });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!spintexValidation.valid) {
      alert('Please fix the template errors before saving');
      return;
    }

    const existing = await storageOps.getTemplates();

    if (selectedTemplate && existing) {
      // Check if it's a new template (not in the list yet)
      const exists = existing.find((t) => t.id === selectedTemplate.id);

      if (exists) {
        // Update existing
        const updated = existing.map((t) =>
          t.id === selectedTemplate.id
            ? { ...t, name: editForm.name, content: editForm.content, updatedAt: Date.now() }
            : t
        );
        await storageOps.setTemplates(updated);
      } else {
        // Create new
        const newTemplate: MessageTemplate = {
          ...selectedTemplate,
          name: editForm.name,
          content: editForm.content,
          updatedAt: Date.now(),
        };
        await storageOps.setTemplates([...existing, newTemplate]);
      }
    }

    setIsEditing(false);
    // Reload templates
    const updated = await storageOps.getTemplates();
    if (updated) {
      const saved = updated.find((t) => t.id === selectedTemplate?.id);
      if (saved) setSelectedTemplate(saved);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const existing = await storageOps.getTemplates();
    const updated = existing?.filter((t) => t.id !== templateId);
    await storageOps.setTemplates(updated || []);

    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setIsEditing(false);
    }
  };

  const handleContentChange = (content: string) => {
    setEditForm({ ...editForm, content });
    setSpintexValidation(validateSpintex(content));
  };

  const getPreviewMessage = () => {
    if (!selectedTemplate && !isEditing) return '';
    const template = editForm.content;
    return previewMessage(template, previewVariables);
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            margin: 0,
            color: '#1a1a1a',
          }}
        >
          Message Templates
        </h2>
        <button
          onClick={handleCreateTemplate}
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
          + New Template
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100% - 70px)' }}>
        {/* Template List Sidebar */}
        <aside
          style={{
            width: '280px',
            border: '1px solid #dbdbdb',
            borderRadius: '12px',
            padding: '12px',
            overflowY: 'auto',
            backgroundColor: '#f8f8f8',
          }}
        >
          {templates && templates.length > 0 ? (
            templates.map((template: MessageTemplate) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsEditing(false);
                }}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor:
                    selectedTemplate?.id === template.id ? '#e8f4fd' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border:
                    selectedTemplate?.id === template.id ? '1px solid #0095f6' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate?.id !== template.id) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate?.id !== template.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: '#1a1a1a',
                  }}
                >
                  {template.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {template.content}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#999',
                fontSize: '13px',
              }}
            >
              No templates yet. Create one to get started.
            </div>
          )}
        </aside>

        {/* Template Editor/Viewer */}
        <main
          style={{
            flex: 1,
            border: '1px solid #dbdbdb',
            borderRadius: '12px',
            backgroundColor: 'white',
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          {selectedTemplate ? (
            isEditing ? (
              <>
                {/* Edit Mode */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#333',
                    }}
                  >
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #dbdbdb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#333',
                    }}
                  >
                    Message Content
                  </label>
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: '6px',
                      }}
                    >
                      <strong>Available variables:</strong> {'{Name}'}, {'{Category}'}, {'{CustomField}'}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong>Spintex:</strong> {'{Hi|Hello|Hey}'} (randomly selects one option)
                    </div>
                  </div>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #dbdbdb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#0095f6')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#dbdbdb')}
                  />
                  {!spintexValidation.valid && spintexValidation.error && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        backgroundColor: '#ffebee',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#c62828',
                      }}
                    >
                      ⚠️ {spintexValidation.error}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#333',
                    }}
                  >
                    Preview (with sample data)
                  </label>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid #dbdbdb',
                      minHeight: '80px',
                    }}
                  >
                    {getPreviewMessage() || 'Your message preview will appear here...'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!spintexValidation.valid}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: spintexValidation.valid ? '#0095f6' : '#bdbdbd',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: spintexValidation.valid ? 'pointer' : 'not-allowed',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (spintexValidation.valid) e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (selectedTemplate) {
                        setEditForm({
                          name: selectedTemplate.name,
                          content: selectedTemplate.content,
                        });
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f5f5f5',
                      color: '#333',
                      border: '1px solid #dbdbdb',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      margin: '0 0 8px',
                      color: '#1a1a1a',
                    }}
                  >
                    {selectedTemplate.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#666',
                      margin: 0,
                    }}
                  >
                    Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()} • Last
                    modified: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#333',
                    }}
                  >
                    Message Content
                  </label>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      border: '1px solid #dbdbdb',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {selectedTemplate.content}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: '#333',
                    }}
                  >
                    Preview (with sample data)
                  </label>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid #dbdbdb',
                    }}
                  >
                    {parseMessage(selectedTemplate.content, previewVariables)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditing(true)}
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
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
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
                    Delete
                  </button>
                </div>
              </>
            )
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#999',
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>📝</div>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Select or create a template
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

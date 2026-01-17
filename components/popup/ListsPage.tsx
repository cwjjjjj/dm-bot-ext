/**
 * Lists Page - Contact List Management
 * CSV import, contact management, export functionality
 */

import { useState } from 'react';
import { useContactLists } from '~/lib/storage-hooks';
import { storageOps } from '~/lib/storage';
import { parseCSV, exportToCSV, downloadCSV, parsedContactsToContacts } from '~/lib/csv-parser';
import { v4 as uuidv4 } from 'uuid';
import type { ContactList, Contact } from '~/types/storage';

export default function ListsPage() {
  const [lists] = useContactLists();
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsImporting(true);
    setImportErrors([]);

    try {
      const { contacts, errors } = await parseCSV(file);
      setImportErrors(errors);

      // Convert parsed contacts to Contact objects
      const contactObjects = parsedContactsToContacts(contacts).map((c) => ({
        ...c,
        id: uuidv4(),
      }));

      // Create new list
      const newList: ContactList = {
        id: uuidv4(),
        name: file.name.replace('.csv', ''),
        contacts: contactObjects,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Save to storage
      const existingLists = await storageOps.getContactLists();
      await storageOps.setContactLists([...(existingLists ?? []), newList]);

      setSelectedList(newList);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import CSV: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    const existingLists = await storageOps.getContactLists();
    const updated = existingLists?.filter((l) => l.id !== listId);
    await storageOps.setContactLists(updated || []);

    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
  };

  const handleExportList = (list: ContactList) => {
    const csv = exportToCSV(list.contacts);
    downloadCSV(csv, `${list.name}-export.csv`);
  };

  const handleResetStatus = async (listId: string) => {
    const existingLists = await storageOps.getContactLists();
    const list = existingLists?.find((l) => l.id === listId);

    if (list && existingLists) {
      list.contacts.forEach((contact) => {
        contact.status = 'pending';
        contact.errorMessage = undefined;
        contact.sentAt = undefined;
        contact.retryCount = undefined;
      });
      list.updatedAt = Date.now();

      await storageOps.setContactLists(existingLists);
      setSelectedList(list);
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'sent':
        return '#c8e6c9';
      case 'failed':
        return '#ffcdd2';
      case 'in_progress':
        return '#fff9c4';
      case 'skipped':
        return '#e0e0e0';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status: Contact['status']) => {
    switch (status) {
      case 'sent':
        return '#2e7d32';
      case 'failed':
        return '#c62828';
      case 'in_progress':
        return '#f57f17';
      case 'skipped':
        return '#616161';
      default:
        return '#666';
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
        Contact Lists
      </h2>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100% - 60px)' }}>
        {/* Sidebar - List & Import */}
        <aside style={{ width: '280px', display: 'flex', flexDirection: 'column' }}>
          {/* Upload Area */}
          <div
            style={{
              border: '2px dashed #dbdbdb',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '16px',
              cursor: 'pointer',
              backgroundColor: isDragging ? '#f0f8ff' : 'transparent',
              transition: 'all 0.2s',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file && file.name.endsWith('.csv')) {
                handleFileSelect(file);
              } else {
                alert('Please select a CSV file');
              }
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFileSelect(file);
              };
              input.click();
            }}
            onMouseEnter={(e) => {
              if (!isDragging) {
                e.currentTarget.style.borderColor = '#0095f6';
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDragging) {
                e.currentTarget.style.borderColor = '#dbdbdb';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                marginBottom: '6px',
                color: '#1a1a1a',
              }}
            >
              Import CSV
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#666',
              }}
            >
              Drag & drop or click to upload
            </div>
            {isImporting && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#0095f6',
                  marginTop: '8px',
                }}
              >
                Importing...
              </div>
            )}
          </div>

          {/* Lists List */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #dbdbdb',
              borderRadius: '12px',
              padding: '8px',
            }}
          >
            {lists && lists.length > 0 ? (
              lists.map((list: ContactList) => (
                <div
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor:
                      selectedList?.id === list.id ? '#e8f4fd' : '#f8f8f8',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border:
                      selectedList?.id === list.id ? '1px solid #0095f6' : '1px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedList?.id !== list.id) {
                      e.currentTarget.style.backgroundColor = '#e8e8e8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedList?.id !== list.id) {
                      e.currentTarget.style.backgroundColor = '#f8f8f8';
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
                    {list.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    {list.contacts.length} contacts
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
                No lists yet. Import a CSV to get started.
              </div>
            )}
          </div>
        </aside>

        {/* Main Content - Contact Details */}
        <main
          style={{
            flex: 1,
            border: '1px solid #dbdbdb',
            borderRadius: '12px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {selectedList ? (
            <>
              {/* Header */}
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #dbdbdb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      margin: '0 0 4px',
                      color: '#1a1a1a',
                    }}
                  >
                    {selectedList.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#666',
                      margin: 0,
                    }}
                  >
                    {selectedList.contacts.length} contacts • Created{' '}
                    {new Date(selectedList.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleExportList(selectedList)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#0095f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleResetStatus(selectedList.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f5a623',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Reset Status
                  </button>
                  <button
                    onClick={() => handleDeleteList(selectedList.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ed4956',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Contact Table */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                  }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f8f8f8',
                      zIndex: 1,
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#666',
                          borderBottom: '1px solid #dbdbdb',
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#666',
                          borderBottom: '1px solid #dbdbdb',
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#666',
                          borderBottom: '1px solid #dbdbdb',
                        }}
                      >
                        Category
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#666',
                          borderBottom: '1px solid #dbdbdb',
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#666',
                          borderBottom: '1px solid #dbdbdb',
                        }}
                      >
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedList.contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        style={{
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f8f8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td
                          style={{
                            padding: '12px',
                            color: '#0095f6',
                            fontWeight: 500,
                          }}
                        >
                          @{contact.username}
                        </td>
                        <td style={{ padding: '12px', color: '#333' }}>
                          {contact.name || '-'}
                        </td>
                        <td style={{ padding: '12px', color: '#333' }}>
                          {contact.category || '-'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: getStatusColor(contact.status),
                              color: getStatusTextColor(contact.status),
                              textTransform: 'capitalize',
                            }}
                          >
                            {contact.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            color: '#ed4956',
                            fontSize: '12px',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={contact.errorMessage}
                        >
                          {contact.errorMessage || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Errors */}
              {importErrors.length > 0 && (
                <div
                  style={{
                    padding: '16px',
                    borderTop: '1px solid #dbdbdb',
                    backgroundColor: '#fff3cd',
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      margin: '0 0 12px',
                      color: '#856404',
                    }}
                  >
                    Import Errors ({importErrors.length})
                  </h4>
                  <div
                    style={{
                      maxHeight: '120px',
                      overflow: 'auto',
                      fontSize: '12px',
                    }}
                  >
                    {importErrors.map((error, index) => (
                      <div
                        key={index}
                        style={{ marginBottom: '4px', color: '#856404' }}
                      >
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999',
              }}
            >
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>📋</div>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Select or import a contact list
              </p>
              <p style={{ fontSize: '13px', marginTop: '8px', margin: 0 }}>
                CSV format: Profile Link, Name, Category
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

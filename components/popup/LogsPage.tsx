/**
 * Logs Page - Activity Logs
 * Display automation history with filtering
 */

import { useState, useEffect } from 'react';
import { useLogs } from '~/lib/storage-hooks';
import { storageOps } from '~/lib/storage';
import type { ActivityLog } from '~/types/storage';

type FilterType = 'all' | 'info' | 'success' | 'warning' | 'error';

export default function LogsPage() {
  const [logsData] = useLogs();
  const [filter, setFilter] = useState<FilterType>('all');
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (logsData) {
      setLogs(logsData);
    }
  }, [logsData]);

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) return;
    await storageOps.clearLogs();
    setLogs([]);
  };

  const filteredLogs = logs
    .filter((log) => filter === 'all' || log.type === filter)
    .reverse(); // Show newest first

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getLogColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'success':
        return '#c8e6c9';
      case 'warning':
        return '#fff9c4';
      case 'error':
        return '#ffcdd2';
      default:
        return '#e8f4fd';
    }
  };

  const getLogBorderColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
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
          Activity Logs
        </h2>
        <button
          onClick={handleClearLogs}
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
          Clear Logs
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '20px' }}>
        {(['all', 'info', 'success', 'warning', 'error'] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: filter === type ? '#0095f6' : '#f5f5f5',
              color: filter === type ? 'white' : '#333',
              border: 'none',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (filter !== type) {
                e.currentTarget.style.backgroundColor = '#e0e0e0';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== type) {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logs List */}
      <div
        style={{
          backgroundColor: '#f8f8f8',
          borderRadius: '12px',
          border: '1px solid #dbdbdb',
          maxHeight: 'calc(100% - 150px)',
          overflow: 'auto',
        }}
      >
        {filteredLogs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
              fontSize: '14px',
            }}
          >
            {filter === 'all' ? 'No logs yet' : `No ${filter} logs found`}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '16px',
                borderBottom: '1px solid #dbdbdb',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  fontSize: '20px',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {getLogIcon(log.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '6px',
                  }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    marginBottom: '6px',
                    color: '#1a1a1a',
                    wordBreak: 'break-word',
                  }}
                >
                  {log.message}
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details>
                    <summary
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      Metadata
                    </summary>
                    <pre
                      style={{
                        fontSize: '11px',
                        color: '#666',
                        backgroundColor: '#f0f0f0',
                        padding: '8px',
                        borderRadius: '4px',
                        marginTop: '8px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {/* Type Badge */}
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: getLogColor(log.type),
                  border: `1px solid ${getLogBorderColor(log.type)}`,
                  color: '#333',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {log.type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

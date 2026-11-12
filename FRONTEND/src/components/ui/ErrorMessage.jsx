import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}) {
  return (
    <div
      className="error-message-card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '18px 22px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-danger-light)',
        border: '1px solid #fecaca',
        color: '#b91c1c',
        boxShadow: 'var(--neu-shadow-sm)',
        margin: '16px 0',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertCircle size={20} color="var(--color-danger)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#991b1b', marginBottom: 2 }}>{title}</h4>
        <p style={{ fontSize: '0.8125rem', color: '#b91c1c', lineHeight: 1.4 }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-sm btn-secondary"
            style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

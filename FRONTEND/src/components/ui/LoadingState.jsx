import React from 'react';

export default function LoadingState({ message = 'Loading data...', size = 32 }) {
  return (
    <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 12 }}>
      <div
        className="spinner"
        style={{
          width: size,
          height: size,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
        }}
      />
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{message}</span>
    </div>
  );
}

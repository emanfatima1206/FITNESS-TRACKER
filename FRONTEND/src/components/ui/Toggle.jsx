export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-switch" style={{ gap: 10 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
      {label && <span style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>{label}</span>}
    </label>
  );
}

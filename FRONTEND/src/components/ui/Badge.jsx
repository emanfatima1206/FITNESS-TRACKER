export default function Badge({ children, variant = 'green' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

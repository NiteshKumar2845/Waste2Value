const LABELS = {
  open: 'Waiting for a collector',
  accepted: 'Collector assigned',
  completed: 'Completed & paid',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}

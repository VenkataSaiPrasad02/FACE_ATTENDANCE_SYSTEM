const statusConfig = {
  PRESENT: {
    bg: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
    text: '#166534',
    label: 'Present',
    shadow: 'rgba(16, 185, 129, 0.2)'
  },

  ABSENT: {
    bg: 'linear-gradient(135deg, #fee2e2, #fecaca)',
    text: '#991b1b',
    label: 'Absent',
    shadow: 'rgba(239, 68, 68, 0.2)'
  },

  REGISTERED: {
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    text: '#1e40af',
    label: 'Registered',
    shadow: 'rgba(37, 99, 235, 0.2)'
  },

  UNKNOWN: {
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    text: '#92400e',
    label: 'Unknown',
    shadow: 'rgba(245, 158, 11, 0.2)'
  },

  // ✅ NEW
  ACTIVE: {
    bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    text: '#166534',
    label: 'Active',
    shadow: 'rgba(34, 197, 94, 0.2)'
  },

  // ✅ NEW
  INACTIVE: {
    bg: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
    text: '#4b5563',
    label: 'Inactive',
    shadow: 'rgba(107, 114, 128, 0.15)'
  },
};

export default function Badge({ status }) {
  const config =
    statusConfig[status] || statusConfig.PRESENT;

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        background: config.bg,
        color: config.text,
        boxShadow: `0 2px 8px ${config.shadow}`
      }}
    >
      {config.label}
    </span>
  );
}
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../utils/helpers';

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['todo'];
  return <span className={`badge ${config.color}`}>{config.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['medium'];
  return (
    <span className={`badge ${config.color} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

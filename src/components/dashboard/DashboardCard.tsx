export default function DashboardCard({
  title,
  value,
  icon,
  change,
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'steady';
  change?: string;
  href?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {href && (
          <a href={href} className="text-xs text-blue-600 hover:underline">
            View
          </a>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      {change && (
        <div className="mt-1 text-xs text-muted-foreground">
          {change}
        </div>
      )}
      {href && (
        <a href={href} className="mt-3 block text-center text-sm text-blue-600 hover:underline">
          Go to {title}
        </a>
      )}
    </div>
  );
}
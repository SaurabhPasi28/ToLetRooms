export default function DashboardCard({ 
    title, value, icon, trend, change 
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend: 'up' | 'down' | 'steady';
    change: string;
  }) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className={`text-sm mt-2 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 'text-gray-500'
            }`}>
              {change}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-600' : 
            trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }
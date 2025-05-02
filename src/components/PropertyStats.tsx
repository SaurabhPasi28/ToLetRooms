import { ChartBarIcon, MapPinIcon, StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function PropertyStats() {
  // Sample data - replace with your actual data fetching logic
  const properties = [
    { id: 1, name: 'Beachfront Villa', location: 'Goa', rating: 4.8, price: 250, bookings: 12 },
    { id: 2, name: 'Mountain Cabin', location: 'Himachal', rating: 4.6, price: 180, bookings: 8 },
    { id: 3, name: 'City Apartment', location: 'Mumbai', rating: 4.3, price: 120, bookings: 15 },
  ];

  const stats = [
    { name: 'Total Properties', value: '3', icon: MapPinIcon },
    { name: 'Average Rating', value: '4.6', icon: StarIcon },
    { name: 'Monthly Revenue', value: '₹24,600', icon: CurrencyDollarIcon },
    { name: 'Occupancy Rate', value: '78%', icon: ChartBarIcon },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Property Statistics</h3>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, statIdx) => (
          <div key={statIdx} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <stat.icon className="h-6 w-6 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Property Performance */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Property Performance</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium">{property.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                      {property.location}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                      {property.rating}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    ₹{property.price}/night
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{property.bookings}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, property.bookings * 5)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart (Placeholder) */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">Monthly Performance</h4>
        <div className="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center">
          <p className="text-gray-500">Monthly bookings and revenue chart will appear here</p>
        </div>
      </div>
    </div>
  );
}
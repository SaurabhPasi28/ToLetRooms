// 'use client';
// import { useState } from 'react';
// import { Search, MapPin, Star, IndianRupee, ShieldCheck } from 'lucide-react'; // Using Lucide (no install needed)

// export default function ListingsPage() {
//   const [filters, setFilters] = useState({
//     city: 'Kota',
//     budget: [2000, 8000],
//     mealIncluded: false,
//     coachingNearby: 'Allen' // Kota-specific
//   });

//   return (
//     <div className="max-w-7xl mx-auto px-4">
//       {/* Hero Search */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-3xl p-8 mb-12 text-white">
//         <h1 className="text-4xl font-bold mb-6">Find Your Perfect Study Space</h1>
        
//         <div className="bg-white rounded-xl p-2 shadow-lg">
//           <div className="flex items-center gap-2 text-gray-500 px-4 py-2 border-b">
//             <Search className="h-5 w-5" />
//             <input 
//               type="text" 
//               placeholder="Search by coaching center or area..."
//               className="flex-1 outline-none"
//             />
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
//             <FilterPill 
//               icon={<MapPin />}
//               label="Location"
//               value="Kota"
//               options={['Kota', 'Delhi', 'Prayagraj']}
//             />
            
//             <FilterPill 
//               icon={<IndianRupee />}
//               label="Budget"
//               value={`₹${filters.budget[0]}-${filters.budget[1]}`}
//               isRange
//             />
            
//             <FilterPill 
//               icon={<ShieldCheck />}
//               label="Verified Only"
//               toggle
//             />
//           </div>
//         </div>
//       </div>

//       {/* Listings Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {[1,2,3,4].map((item) => (
//           <ListingCard key={item} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // Reusable Filter Component
// const FilterPill = ({ icon, label, value, options, isRange, toggle }) => (
//   <div className="border rounded-full px-4 py-2 cursor-pointer hover:bg-gray-50">
//     <div className="flex items-center gap-2">
//       <span className="text-blue-600">{icon}</span>
//       <div>
//         <p className="text-xs text-gray-500">{label}</p>
//         <p className="font-medium">{value || 'Select'}</p>
//       </div>
//     </div>
//   </div>
// );

// // Enhanced Listing Card
// const ListingCard = () => (
//   <div className="border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
//     <div className="relative">
//       <img 
//         src="https://source.unsplash.com/random/400x300/?hostel" 
//         className="w-full h-48 object-cover"
//         alt="PG Photo"
//       />
//       <button className="absolute top-3 right-3">
//         <HeartIcon />
//       </button>
//     </div>
    
//     <div className="p-4">
//       <div className="flex justify-between">
//         <h3 className="font-bold">Quiet AC Room Near Allen</h3>
//         <div className="flex items-center">
//           <Star className="h-4 w-4 fill-yellow-400" />
//           <span>4.9</span>
//         </div>
//       </div>
      
//       <p className="text-gray-500 text-sm mt-1">2km from Allen, Kota</p>
//       <p className="text-gray-500 text-sm">Meals Included</p>
      
//       <div className="mt-4 flex items-center justify-between">
//         <p className="font-bold flex items-center">
//           <IndianRupee className="h-4 w-4" />
//           5,500/month
//         </p>
//         <button className="text-blue-600 font-medium">View</button>
//       </div>
//     </div>
//   </div>
// );
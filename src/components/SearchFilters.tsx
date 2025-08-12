// 'use client';

// import { useRouter } from 'next/navigation';
// import { useState } from 'react';

// export default function SearchFilters() {
//   const [searchParams, setSearchParams] = useState({
//     location: '',
//     checkIn: '',
//     checkOut: '',
//     guests: 1
//   });
//   const router = useRouter();

//   const handleSearch = () => {
//     const query = new URLSearchParams();
//     if (searchParams.location) query.set('location', searchParams.location);
//     if (searchParams.checkIn) query.set('checkIn', searchParams.checkIn);
//     if (searchParams.checkOut) query.set('checkOut', searchParams.checkOut);
//     query.set('guests', searchParams.guests.toString());
    
//     router.push(`/search?${query.toString()}`);
//   };

//   return (
//     <div className="bg-white rounded-full shadow-lg p-2 w-full max-w-2xl">
//       <div className="flex flex-col md:flex-row items-center">
//         <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
//           <label className="block text-xs font-medium text-gray-500">Where</label>
//           <input
//             type="text"
//             placeholder="Search destinations"
//             className="w-full outline-none"
//             value={searchParams.location}
//             onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
//           />
//         </div>
//         {/* Add similar inputs for check-in, check-out, guests */}
//         <button
//           onClick={handleSearch}
//           className="bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-colors"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// }
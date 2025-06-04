// "use client"
// import {MapPin, Star, Users } from 'lucide-react';
// import Link from 'next/link';
// import Image from 'next/image';

// import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';

// export default function PropertyCard({property, editable = false}: { property: unknown;editable?: boolean;}) {
//     const router = useRouter();
//     const handleDelete = async () => {
//     if (confirm('Are you sure you want to delete this property?')) {
//       try {

//         const deleteImagePromises = property.images.map(async (imageUrl:string) => {
//         const publicId = imageUrl.split('/').pop()?.split('.')[0];
//         if (!publicId) return;
        
//         await fetch('/api/sign-upload/delete', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ publicId })
//         });
//       });

//       await Promise.all(deleteImagePromises);

//         const response = await fetch(`/api/properties/${property._id}`, {
//           method: 'DELETE'
//         });
        
//         if (response.ok) {
//           toast.success('Property deleted');
//           router.refresh(); // Refresh the page to show updated list
//         } else {
//           throw new Error('Delete failed');
//         }
//       } catch (error) {
//         console.log(error);
//         toast.error('Failed to delete property',);
//       }
//     }
//   };
//   return (
//     <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
//       <div className="relative aspect-video bg-gray-100">
//         {property.images?.[0] ? (
//           <Image
//             src={property.images[0]}
//             alt={property.title}
//             fill
//             className="object-cover"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full text-gray-400">
//             No Image
//           </div>
//         )}
//       </div>
      
//       <div className="p-4">
//         <div className="flex justify-between items-start">
//           <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
//           <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
//             {property.isActive ? 'Active' : 'Draft'}
//           </span>
//         </div>
        
//         <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
//           <MapPin className="w-4 h-4" />
//           <span className="line-clamp-1">
//             {property.address.city}, {property.address.state}
//           </span>
//         </div>
        
//         <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
//           <div className="flex items-center gap-1">
//             <Users className="w-4 h-4" />
//             {property.maxGuests} guests
//           </div>
//           <div className="flex items-center gap-1">
//             <Star className="w-4 h-4" />
//             {property.bedrooms} beds
//           </div>
//           <div className="flex items-center gap-1">
//             ₹{property.price}/night
//           </div>
//         </div>
        
//         {editable && (
//           <div className="flex gap-2 mt-4">
//         <Link
//           href={`/host/edit/${property._id}`}
//           className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
//         >
//           Edit
//         </Link>
//         <button 
//           onClick={handleDelete}
//           className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
//         >
//           Delete
//         </button>
//       </div>
//         )}
//       </div>
//     </div>
//   );
// }


/// after fixing to show multiple image

"use client"
import { MapPin, Star, Users, ChevronLeft, ChevronRight,Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// type MediaItem = {
//   url: string;
//   type: 'image' | 'video';
// };

export default function PropertyCard({ property, editable = false }: { 
  property: {
    _id: string;
    title: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    isActive: boolean;
    address: {
      city: string;
      state: string;
    };
    maxGuests: number;
    bedrooms: number;
    price: number;
  };
  editable?: boolean;
}) {
  const router = useRouter();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePrev = () => {
    setCurrentMediaIndex(prev => 
      prev === 0 ? property.media!.length - 1 : prev - 1
    );
    // Pause video when navigating
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleNext = () => {
    setCurrentMediaIndex(prev => 
      prev === property.media!.length - 1 ? 0 : prev + 1
    );
    // Pause video when navigating
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // const handleCardClick = () => {
  //   router.push(`/properties/${property._id}`);
  // };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        const deleteMediaPromises = property.media!.map(async (media) => {
          const publicId = media.url.split('/').pop()?.split('.')[0];
          if (!publicId) return;
          
          await fetch('/api/sign-upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
          });
        });

        await Promise.all(deleteMediaPromises);

        const response = await fetch(`/api/properties/${property._id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Property deleted');
          router.refresh();
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        console.log(error);
        toast.error('Failed to delete property');
      }
    }
  };

  const currentMedia = property.media?.[currentMediaIndex];

  return (
    <Link href={`/properties/${property._id}`} className="block">
    {/* <div onClick={handleCardClick} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"> */}
     <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-video bg-gray-100">
        {property.media?.length ? (
          <>
            {currentMedia?.type === 'image' ? (
              <Image
                src={currentMedia.url}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
            ) : currentMedia?.type === 'video' ? (
              <video
                ref={videoRef}
                src={currentMedia.url}
                className="object-cover w-full h-full"
                controls={false}
                muted
                loop
                playsInline
              />
            ) : null}
            
            {/* Navigation arrows (only show if multiple media items exist) */}
            {property.media.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            
            {/* Media type indicator and position */}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md z-10">
              {currentMediaIndex + 1}/{property.media.length}
              {currentMedia?.type === 'video' && (
                <span className="ml-1">🎥</span>
              )}
            </div>

            {/* Media indicator dots */}
            {property.media.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {property.media.map((media, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentMediaIndex 
                        ? media.type === 'video' ? 'bg-blue-400' : 'bg-white' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Media
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-1">{property.title}</h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {property.isActive ? 'Active' : 'Draft'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">
            {property.address.city}, {property.address.state}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.maxGuests} guests
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center gap-1">
            ₹{property.price}/night
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-2 mt-4">
            <Link
              href={`/host/edit/${property._id}`}
              className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="text-sm px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        )}

        {!editable && (
  <div className="mt-4">
    <Link
      href={`/book/${property._id}`}
      className="flex items-center justify-center gap-2 text-sm px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-full"
    >
      <Calendar className="w-4 h-4" />
      Book Now
    </Link>
  </div>
)}
      </div>
    </div>
  </Link>
  );
}


// src/components/ListingCard.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function ListingCard({ listing }: { listing:any }) {
  return (
    <Link href={`/listings/${listing._id}`} className="group">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
        <Image
          src={listing.images[0] || '/placeholder-room.jpg'}
          alt={listing.title}
          width={400}
          height={300}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">{listing.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{listing.location.landmark}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">₹{listing.price}/mo</p>
      </div>
    </Link>
  );
}
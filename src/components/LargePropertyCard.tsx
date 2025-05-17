import Image from 'next/image';

export default function LargePropertyCard({ property }: { property: any }) {
  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-64">
        <Image 
          src={property.imageUrl}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg">{property.title}</h3>
        <p className="text-gray-500 text-sm">{property.dates}</p>
        <p className="mt-2 font-semibold">{property.price}</p>
        <div className="flex items-center mt-1">
          <span className="text-sm">★ {property.rating}</span>
          <span className="mx-1">·</span>
          <span className="text-sm text-gray-500">{property.location}</span>
        </div>
      </div>
    </div>
  );
}
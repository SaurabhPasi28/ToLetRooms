import Image from 'next/image'
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid'

interface Property {
  id: string
  title: string
  location: string
  distance: string
  dates: string
  price: number
  rating: number
  image: string
  isSuperhost?: boolean
  isGuestFavorite?: boolean
}

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="group cursor-pointer">
      {/* Image with favorite button */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button className="absolute top-3 right-3 text-white hover:text-rose-500">
          <HeartIcon className="w-6 h-6" />
        </button>
        {property.isGuestFavorite && (
          <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-semibold">
            Guest favorite
          </div>
        )}
      </div>

      {/* Property details */}
      <div className="mt-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{property.title}</h3>
          <div className="flex items-center">
            <StarIcon className="w-4 h-4 mr-1" />
            <span>{property.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{property.location}</p>
        <p className="text-gray-500 text-sm">{property.dates}</p>
        <p className="mt-2">
          <span className="font-semibold">₹{property.price.toLocaleString()}</span> night
        </p>
      </div>
    </div>
  )
}
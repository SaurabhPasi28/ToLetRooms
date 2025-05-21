import PropertyCard from './PropertyCard'

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


// const properties = [
//     {
//       id: 1,
//       title: 'Stay with Pink Barrel Ball',
//       location: 'Pekutatan, Indonesia',
//       dates: '9–14 Jul',
//       price: 120,
//       rating: 4.86,
//       image: '/property1.jpg'
//     },
//     {
//       id: 2,
//       title: 'Cozy Cottage by the Lake',
//       location: 'Nainital, Uttarakhand',
//       dates: '5–10 Aug',
//       price: 95,
//       rating: 4.72,
//       image: '/property2.jpg'
//     },
//     {
//       id: 3,
//       title: 'Luxury Apartment in Cyber Hub',
//       location: 'Gurgaon, Haryana',
//       dates: '15–20 Sep',
//       price: 150,
//       rating: 4.89,
//       image: '/property3.jpg'
//     },
//     {
//       id: 4,
//       title: 'Backwater View House',
//       location: 'Alleppey, Kerala',
//       dates: '22–27 Jul',
//       price: 110,
//       rating: 4.91,
//       image: '/property4.jpg'
//     },
//     {
//       id: 5,
//       title: 'Modern Studio in the Hills',
//       location: 'Manali, Himachal Pradesh',
//       dates: '1–6 Aug',
//       price: 80,
//       rating: 4.67,
//       image: '/property5.jpg'
//     },
//     {
//       id: 6,
//       title: 'Royal Heritage Haveli',
//       location: 'Jaipur, Rajasthan',
//       dates: '10–15 Sep',
//       price: 140,
//       rating: 4.95,
//       image: '/property6.jpg'
//     },
//     {
//       id: 7,
//       title: 'Peaceful Farm Stay',
//       location: 'Coorg, Karnataka',
//       dates: '3–8 Aug',
//       price: 100,
//       rating: 4.74,
//       image: '/property7.jpg'
//     },
//     {
//       id: 8,
//       title: 'Beachside Hut Retreat',
//       location: 'Gokarna, Karnataka',
//       dates: '12–17 Jul',
//       price: 70,
//       rating: 4.66,
//       image: '/property8.jpg'
//     }
//   ];
interface PropertyGridProps {
  properties: Property[]
}

export default function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
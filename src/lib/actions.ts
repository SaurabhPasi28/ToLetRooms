import { dbConnect } from './dbConnect'
import Property from '@/models/Property'

export async function getFeaturedProperties() {
  await dbConnect()
  
  // In a real app, you would fetch from your database
  // This is mock data for demonstration
  return [
    {
      id: '1',
      title: 'Stay with Pink Barrel Ball',
      location: 'Pokutatan, Indonesia',
      distance: '2,000 kilometers away',
      dates: '9-14 Jul',
      price: 12000,
      rating: 4.86,
      image: '/property1.jpg',
      isGuestFavorite: true
    },
    {
      id: '2',
      title: 'Stay with Bua - F&D business',
      location: 'Bangkok, Thailand',
      distance: '2,500 kilometers away',
      dates: '16-21 Jul',
      price: 8500,
      rating: 4.92,
      image: '/property2.jpg'
    },
    // Add more properties as needed
  ] as unknown
}

export async function searchProperties(params: Record<string, string>) {
  await connectToDB()
  
  const query: any = {}
  
  // Location filter
  if (params.location) {
    query.$or = [
      { 'address.city': new RegExp(params.location, 'i') },
      { 'address.areaOrLocality': new RegExp(params.location, 'i') },
      { 'address.state': new RegExp(params.location, 'i') }
    ]
  }
  
  // Date filters
  if (params.checkIn && params.checkOut) {
    query.availability = {
      $not: {
        $elemMatch: {
          from: { $lte: new Date(params.checkOut) },
          to: { $gte: new Date(params.checkIn) }
        }
      }
    }
  }
  
  // Guest filters
  if (params.adults || params.children) {
    const totalGuests = (parseInt(params.adults || '0') + parseInt(params.children || '0'))
    if (totalGuests > 0) {
      query.maxGuests = { $gte: totalGuests }
    }
  }
  
  return await Property.find(query).limit(50).lean()
}
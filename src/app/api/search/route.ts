import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Property from '@/models/Property';

interface SearchParams {
  query?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  bedrooms?: string;
  maxGuests?: string;
  amenities?: string;
  checkIn?: string;
  checkOut?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const params: SearchParams = Object.fromEntries(searchParams.entries());
    
    const query: any = { isActive: true };
    const sort: any = { createdAt: -1 };
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const skip = (page - 1) * limit;

    // Text search across all address fields and property details
    if (params.query) {
      const searchQuery = params.query.trim();
      
      // Create a comprehensive text search
      query.$or = [
        // Exact matches for better relevance
        { 'address.pinCode': searchQuery },
        { 'address.city': { $regex: `^${searchQuery}`, $options: 'i' } },
        { 'address.state': { $regex: `^${searchQuery}`, $options: 'i' } },
        { 'address.areaOrLocality': { $regex: `^${searchQuery}`, $options: 'i' } },
        { 'address.street': { $regex: `^${searchQuery}`, $options: 'i' } },
        { 'address.landmark': { $regex: `^${searchQuery}`, $options: 'i' } },
        { 'address.buildingName': { $regex: `^${searchQuery}`, $options: 'i' } },
        
        // Partial matches
        { 'address.city': { $regex: searchQuery, $options: 'i' } },
        { 'address.state': { $regex: searchQuery, $options: 'i' } },
        { 'address.areaOrLocality': { $regex: searchQuery, $options: 'i' } },
        { 'address.street': { $regex: searchQuery, $options: 'i' } },
        { 'address.landmark': { $regex: searchQuery, $options: 'i' } },
        { 'address.buildingName': { $regex: searchQuery, $options: 'i' } },
        
        // Property details
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Location filter - this is the key part for sidebar location search
    if (params.location) {
      const locationQuery = params.location.trim();
      
      // If we already have a $or query from text search, we need to combine them
      if (query.$or) {
        // Add location-specific search to existing $or query
        query.$or.push(
          { 'address.city': { $regex: locationQuery, $options: 'i' } },
          { 'address.areaOrLocality': { $regex: locationQuery, $options: 'i' } },
          { 'address.street': { $regex: locationQuery, $options: 'i' } },
          { 'address.landmark': { $regex: locationQuery, $options: 'i' } },
          { 'address.pinCode': locationQuery }
        );
      } else {
        // Create new location-specific search
        query.$or = [
          { 'address.city': { $regex: locationQuery, $options: 'i' } },
          { 'address.areaOrLocality': { $regex: locationQuery, $options: 'i' } },
          { 'address.street': { $regex: locationQuery, $options: 'i' } },
          { 'address.landmark': { $regex: locationQuery, $options: 'i' } },
          { 'address.pinCode': locationQuery }
        ];
      }
    }

    // Location-based search with geospatial queries
    if (params.latitude && params.longitude && params.radius) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      const radius = parseFloat(params.radius) || 10; // Default 10km radius
      
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
      
      // Sort by distance when doing location search
      sort.score = { $meta: 'textScore' };
    }

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      query.price = {};
      if (params.minPrice) query.price.$gte = parseInt(params.minPrice);
      if (params.maxPrice) query.price.$lte = parseInt(params.maxPrice);
    }

    // Property type filter
    if (params.propertyType) {
      query.propertyType = params.propertyType.toLowerCase();
    }

    // Bedrooms filter
    if (params.bedrooms) {
      query.bedrooms = { $gte: parseInt(params.bedrooms) };
    }

    // Guest capacity filter
    if (params.maxGuests) {
      query.maxGuests = { $gte: parseInt(params.maxGuests) };
    }

    // Amenities filter
    if (params.amenities) {
      const amenities = params.amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenities };
    }

    // Availability filter
    if (params.checkIn && params.checkOut) {
      const checkIn = new Date(params.checkIn);
      const checkOut = new Date(params.checkOut);
      
      query.$or = [
        { availability: { $exists: false } },
        {
          $and: [
            { 'availability.startDate': { $lte: checkIn } },
            { 'availability.endDate': { $gte: checkOut } }
          ]
        }
      ];
    }

    // Sorting options
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_low':
          sort.price = 1;
          break;
        case 'price_high':
          sort.price = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'rating':
          // Add rating field when implemented
          break;
        default:
          sort.createdAt = -1;
      }
    }

    console.log('Search query:', JSON.stringify(query, null, 2)); // Debug log

    // Execute search with pagination
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('host', 'name email')
        .lean(),
      Property.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Transform and enhance results
    const enhancedProperties = properties.map(property => ({
      _id: property._id.toString(),
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.propertyType,
      address: {
        ...property.address,
        fullAddress: [
          property.address.houseNumber,
          property.address.buildingName,
          property.address.street,
          property.address.landmark,
          property.address.areaOrLocality,
          property.address.city,
          property.address.state,
          property.address.pinCode
        ].filter(Boolean).join(', ')
      },
      media: property.media || [],
      amenities: property.amenities || [],
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      isActive: property.isActive,
      host: {
        _id: property.host._id.toString(),
        // name: property.host.name,
        // email: property.host.email
      },
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));

    return NextResponse.json({
      properties: enhancedProperties,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: total,
        hasNextPage,
        hasPrevPage,
        limit
      },
      searchInfo: {
        query: params.query,
        location: params.location,
        filters: {
          location: params.location,
          priceRange: params.minPrice || params.maxPrice ? {
            min: params.minPrice,
            max: params.maxPrice
          } : null,
          propertyType: params.propertyType,
          bedrooms: params.bedrooms,
          maxGuests: params.maxGuests,
          amenities: params.amenities ? params.amenities.split(',') : null
        }
      }
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    );
  }
}
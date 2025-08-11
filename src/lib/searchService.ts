import { dbConnect } from './dbConnect';
import Property from '@/models/Property';

export interface SearchSuggestion {
  type: 'city' | 'area' | 'street' | 'landmark' | 'pinCode';
  value: string;
  display: string;
  count: number;
}

export interface SearchResult {
  properties: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  searchInfo: {
    query?: string;
    filters: any;
  };
}

export class SearchService {
  static async getSearchSuggestions(query: string, limit: number = 10): Promise<SearchSuggestion[]> {
    await dbConnect();
    
    if (!query || query.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    const searchRegex = new RegExp(`^${query}`, 'i');

    try {
      // Get city suggestions
      const cities = await Property.aggregate([
        { $match: { isActive: true, 'address.city': searchRegex } },
        { $group: { _id: '$address.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      cities.forEach(city => {
        suggestions.push({
          type: 'city',
          value: city._id,
          display: `${city._id} (${city.count} properties)`,
          count: city.count
        });
      });

      // Get area suggestions
      const areas = await Property.aggregate([
        { $match: { isActive: true, 'address.areaOrLocality': searchRegex } },
        { $group: { _id: '$address.areaOrLocality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      areas.forEach(area => {
        suggestions.push({
          type: 'area',
          value: area._id,
          display: `${area._id} (${area.count} properties)`,
          count: area.count
        });
      });

      // Get street suggestions
      const streets = await Property.aggregate([
        { $match: { isActive: true, 'address.street': searchRegex } },
        { $group: { _id: '$address.street', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      streets.forEach(street => {
        suggestions.push({
          type: 'street',
          value: street._id,
          display: `${street._id} (${street.count} properties)`,
          count: street.count
        });
      });

      // Get landmark suggestions
      const landmarks = await Property.aggregate([
        { $match: { isActive: true, 'address.landmark': { $regex: query, $options: 'i' } } },
        { $group: { _id: '$address.landmark', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);

      landmarks.forEach(landmark => {
        suggestions.push({
          type: 'landmark',
          value: landmark._id,
          display: `${landmark._id} (${landmark.count} properties)`,
          count: landmark.count
        });
      });

      // Get PIN code suggestions
      if (/^\d{1,6}$/.test(query)) {
        const pinCodes = await Property.aggregate([
          { $match: { isActive: true, 'address.pinCode': new RegExp(`^${query}`) } },
          { $group: { _id: '$address.pinCode', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ]);

        pinCodes.forEach(pinCode => {
          suggestions.push({
            type: 'pinCode',
            value: pinCode._id,
            display: `${pinCode._id} (${pinCode.count} properties)`,
            count: pinCode.count
          });
        });
      }

      // Sort by relevance and count, remove duplicates
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.value === suggestion.value)
        )
        .sort((a, b) => {
          // Prioritize exact matches
          const aExact = a.value.toLowerCase().startsWith(query.toLowerCase());
          const bExact = b.value.toLowerCase().startsWith(query.toLowerCase());
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Then sort by count
          return b.count - a.count;
        })
        .slice(0, limit);

      return uniqueSuggestions;

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  static async searchProperties(params: any): Promise<SearchResult> {
    await dbConnect();
    
    const query: any = { isActive: true };
    const sort: any = { createdAt: -1 };
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const skip = (page - 1) * limit;

    // Enhanced text search with relevance scoring
    if (params.query) {
      const searchQuery = params.query.trim();
      
      // Use MongoDB text search for better relevance
      query.$text = { $search: searchQuery };
      sort.score = { $meta: 'textScore' };
    }

    // Location-based search
    if (params.latitude && params.longitude && params.radius) {
      const lat = parseFloat(params.latitude);
      const lng = parseFloat(params.longitude);
      const radius = parseFloat(params.radius) || 10;
      
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius * 1000
        }
      };
    }

    // Apply other filters
    if (params.minPrice || params.maxPrice) {
      query.price = {};
      if (params.minPrice) query.price.$gte = parseInt(params.minPrice);
      if (params.maxPrice) query.price.$lte = parseInt(params.maxPrice);
    }

    if (params.propertyType) {
      query.propertyType = params.propertyType.toLowerCase();
    }

    if (params.bedrooms) {
      query.bedrooms = { $gte: parseInt(params.bedrooms) };
    }

    if (params.maxGuests) {
      query.maxGuests = { $gte: parseInt(params.maxGuests) };
    }

    if (params.amenities) {
      const amenities = params.amenities.split(',').map((a: string) => a.trim());
      query.amenities = { $all: amenities };
    }

    // Execute search
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('host', 'name email')
        .lean(),
      Property.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      properties: properties.map(property => ({
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
          name: property.host.name,
          email: property.host.email
        },
        createdAt: property.createdAt,
        updatedAt: property.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      searchInfo: {
        query: params.query,
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
    };
  }

  static async getPopularLocations(limit: number = 10): Promise<Array<{ city: string; count: number }>> {
    await dbConnect();
    
    try {
      const popularCities = await Property.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$address.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { city: '$_id', count: 1, _id: 0 } }
      ]);

      return popularCities;
    } catch (error) {
      console.error('Error getting popular locations:', error);
      return [];
    }
  }
}
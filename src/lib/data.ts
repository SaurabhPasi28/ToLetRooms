import { dbConnect } from './dbConnect';
import Property from '@/models/Property';
import { filterByIndianAddress } from './addressFilter';

export async function searchProperties(params) {
  await dbConnect();
  
  let query = {};
  
  // Basic filters
  if (params.location) {
    query['$or'] = [
      { 'address.city': new RegExp(params.location, 'i') },
      { 'address.areaOrLocality': new RegExp(params.location, 'i') }
    ];
  }
  
  if (params.minPrice || params.maxPrice) {
    query.price = {};
    if (params.minPrice) query.price.$gte = parseInt(params.minPrice);
    if (params.maxPrice) query.price.$lte = parseInt(params.maxPrice);
  }
  
  let properties = await Property.find(query).lean();
  
  // Apply Indian address filters
  if (params.state || params.city || params.district) {
    properties = filterByIndianAddress(properties, {
      state: params.state,
      city: params.city,
      district: params.district,
      area: params.area
    });
  }
  
  return properties;
}
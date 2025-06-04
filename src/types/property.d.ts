// types/property.d.ts
import { Types, Document } from 'mongoose';

interface Coordinates {
  type: string;
  coordinates: number[];
}

interface PropertyAddress {
  houseNumber?: string;
  buildingName?: string;
  street: string;
  landmark?: string;
  areaOrLocality: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  coordinates: Coordinates;
}

interface PropertyAvailability {
  startDate?: Date;
  endDate?: Date;
}

export interface IProperty extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  propertyType: 'apartment' | 'house' | 'villa' | 'pg' | 'hostel';
  address: PropertyAddress;
  media: string[];
  host: Types.ObjectId;
  amenities?: ('wifi' | 'ac' | 'kitchen' | 'parking' | 'tv')[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  availability?: PropertyAvailability;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
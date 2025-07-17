import { Types } from "mongoose";
export interface PropertyAddress {
  houseNumber?: string;
  buildingName?: string;
  street: string;
  landmark?: string;
  areaOrLocality: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IProperty {
  _id?: string; // optional for creating, required when fetched
  title: string;
  description: string;
  price: number;
  propertyType: 'apartment' | 'house' | 'villa' | 'pg' | 'hostel';
  address: PropertyAddress;
  media: string[];
  // host: string; // populated as string from ObjectId
  host: Types.ObjectId;
  amenities: ('wifi' | 'ac' | 'kitchen' | 'parking' | 'tv')[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  isActive: boolean;
  availability?: {
    startDate?: Date;
    endDate?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}


export type LeanProperty = IProperty & { _id: string; host: Types.ObjectId };

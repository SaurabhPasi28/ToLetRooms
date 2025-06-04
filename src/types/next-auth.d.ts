// types/next-auth.d.ts

// import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string|"";
      role: string;
      googleId?: string|"";
    };
  }

  interface User {
    id: string;
    role: string;
    googleId?: string;
  }

  interface JWT {
    id: string;
    role: string;
    googleId?: string;
  }
}



// types.ts
export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  pinCode: string;
  areaOrLocality?: string;
  houseNumber?: string;
}

export interface PropertyAvailability {
  startDate?: string;
  endDate?: string;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'pg' | 'hostel';

export interface PropertyData {
  _id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  address: PropertyAddress;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities?: string[];
  media: string[];
  availability?: PropertyAvailability;
  host: string;
}

export interface PropertyFormProps {
  initialData?: PropertyData;
  isEditMode?: boolean;
}

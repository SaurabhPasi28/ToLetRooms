// lib/api/properties.ts
export async function getFeaturedProperties(): Promise<Property[]> {
    try {
      const res = await fetch(`${process.env.API_URL}/properties/featured`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
  }
  
  export type Property = {
    id: string;
    title: string;
    location: string;
    pricePerNight: number;
    rating: number;
    imageUrl: string;
    // ... other fields
  };
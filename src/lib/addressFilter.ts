
// type PropertyAddress = {
//   state: string;
//   city: string;
//   district?: string;
//   areaOrLocality: string;
// };

// type Property = {
//   address: PropertyAddress;
//   [key: string]: any; // for other fields
// };

// type Filters = {
//   state?: string;
//   city?: string;
//   district?: string;
//   area?: string;
// };

// export function filterByIndianAddress(properties: Property[], filters: Filters): Property[] {
//   return properties.filter((property) => {
//     // Filter by state
//     if (filters.state && property.address.state !== filters.state) return false;

//     // Filter by city
//     if (filters.city && property.address.city !== filters.city) return false;

//     // Filter by district
//     if (filters.district && property.address.district !== filters.district) return false;

//     // Filter by area/locality
//     if (
//       filters.area &&
//       !property.address.areaOrLocality.toLowerCase().includes(filters.area.toLowerCase())
//     )
//       return false;

//     return true;
//   });
// }



import { LeanProperty } from '@/types/property';

type Filters = {
  state?: string;
  city?: string;
  district?: string;
  area?: string;
};

export function filterByIndianAddress(properties: LeanProperty[], filters: Filters): LeanProperty[] {
  return properties.filter((property) => {
    if (filters.state && property.address.state !== filters.state) return false;
    if (filters.city && property.address.city !== filters.city) return false;
    // if (filters.district && property.address.district !== filters.district) return false;
    if (
      filters.area &&
      !property.address.areaOrLocality.toLowerCase().includes(filters.area.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

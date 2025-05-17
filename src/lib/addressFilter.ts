export function filterByIndianAddress(properties, filters) {
    return properties.filter(property => {
      // Filter by state
      if (filters.state && property.address.state !== filters.state) return false;
      
      // Filter by city
      if (filters.city && property.address.city !== filters.city) return false;
      
      // Filter by district
      if (filters.district && property.address.district !== filters.district) return false;
      
      // Filter by area/locality
      if (filters.area && !property.address.areaOrLocality.includes(filters.area)) return false;
      
      return true;
    });
  }
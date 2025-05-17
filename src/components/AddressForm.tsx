// components/AddressForm.tsx
'use client';
import { useState } from 'react';

type IndianAddress = {
  houseNumber: string;
  buildingName: string;
  street: string;
  landmark: string;
  areaOrLocality: string;
  villageOrTown: string;
  postOffice: string;
  talukaOrTehsil: string;
  district: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
};

export function IndianAddressForm({ onSave }: { onSave: (address: IndianAddress) => void }) {
  const [formData, setFormData] = useState<IndianAddress>({} as IndianAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateIndianAddress(formData)) {
      onSave(formData);
    }
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>House Number*</label>
          <input required value={formData.houseNumber} onChange={e => setFormData({...formData, houseNumber: e.target.value})} />
        </div>
        
        {/* Add all other fields from JSON structure similarly */}
        
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-full">
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
}

function validateIndianAddress(address: IndianAddress): boolean {
  // Add comprehensive validation logic for Indian addresses
  return !!address.pinCode && address.pinCode.length === 6;
}
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HostDashboard() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: { city: "", landmark: "" }, // Updated nested structure
    type: "PG",
    amenities: [] as string[],
    contactNumber: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.price || !formData.location.city || !formData.contactNumber) {
      alert("Please fill all required fields (Price, City, Contact Number)");
      return;
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price), // Convert string to number
        }),
      });
      if (res.ok) router.push('/dashboard/host');
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">List Your Room</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Title (e.g., AC Room near Resonance)"
          className="w-full p-2 border rounded"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Price (₹/month)"
          className="w-full p-2 border rounded"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />

        {/* City */}
        <input
          type="text"
          placeholder="City (e.g., Kota)"
          className="w-full p-2 border rounded"
          value={formData.location.city}
          onChange={(e) => setFormData({
            ...formData,
            location: { ...formData.location, city: e.target.value }
          })}
          required
        />

        {/* Contact Number */}
        <input
          type="tel"
          placeholder="Contact Number (+91XXXXXXXXXX)"
          className="w-full p-2 border rounded"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          required
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
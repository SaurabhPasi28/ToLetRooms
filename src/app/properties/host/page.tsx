'use client';
import PropertyForm from '@/components/property/PropertyForm';

export default function HostPropertyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-6">
      <PropertyForm isEditMode={false} />
    </div>
  );
}
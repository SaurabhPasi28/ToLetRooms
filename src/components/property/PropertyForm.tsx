'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { FormStepper } from "@/components/ui/FormStepper";
import MediaUploader from '@/components/property/MediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description needs 50+ characters"),
  propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'hostel']),
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    pinCode: z.string().length(6),
    areaOrLocality: z.string().optional(),
    houseNumber: z.string().optional(),
  }),
  price: z.number().min(500).max(100000),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  maxGuests: z.number().min(1),
  amenities: z.array(z.string()).optional(),
  media: z.array(z.string().url()).min(1, "At least 1 image is required")
});

type FormData = z.infer<typeof formSchema>;

interface PropertyFormProps {
  initialData?: any;
  isEditMode?: boolean;
}

export default function PropertyForm({ initialData, isEditMode = false }: PropertyFormProps) {
  const [step, setStep] = useState(1);
  const [media, setMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: 'apartment',
      amenities: [],
      address: {
        areaOrLocality: '',
        houseNumber: ''
      }
    }
  });

  // Set initial form values when initialData changes
  useEffect(() => {
    if (initialData && isEditMode) {
      const defaultValues = {
        title: initialData.title || '',
        description: initialData.description || '',
        propertyType: initialData.propertyType || 'apartment',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          pinCode: initialData.address?.pinCode || '',
          areaOrLocality: initialData.address?.areaOrLocality || '',
          houseNumber: initialData.address?.houseNumber || ''
        },
        price: initialData.price || 0,
        bedrooms: initialData.bedrooms || 1,
        bathrooms: initialData.bathrooms || 1,
        maxGuests: initialData.maxGuests || 1,
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
        media: Array.isArray(initialData.media) ? initialData.media : []
      };

      reset(defaultValues);
      setMedia(Array.isArray(initialData.media) ? initialData.media : []);
    }
  }, [initialData, isEditMode, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode 
        ? `/api/properties/${initialData._id}`
        : '/api/properties';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          media
        })
      });

      if (response.ok) {
        toast.success(isEditMode ? 'Property updated!' : 'Property listed!');
        router.push('/properties/listed');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevent any default button behavior
    
    const fields = step === 1 
      ? ['title', 'description', 'propertyType']
      : ['address.street', 'address.city', 'address.state', 'address.pinCode'];
    
    const isValid = await trigger(fields);
    if (isValid) {
      setStep(step + 1);
    } else {
      toast.error('Please fill all required fields');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    // Only allow form submission on step 3
    if (step !== 3) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Property' : 'List Your Property'}
      </h1>
      
      <FormStepper currentStep={step} steps={['Basic Info', 'Location', 'Details']} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title*</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Cozy apartment near college"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your property in detail..."
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type*</Label>
              <select
                id="propertyType"
                {...register('propertyType')}
                className="w-full p-2 border rounded"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
              </select>
              {errors.propertyType && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street*</Label>
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder="Enter street address"
                />
                {errors.address?.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="areaOrLocality">Locality/Area</Label>
                <Input
                  id="areaOrLocality"
                  {...register('address.areaOrLocality')}
                  placeholder="Enter locality/area"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City*</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="Enter city"
                />
                {errors.address?.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State*</Label>
                <Input
                  id="state"
                  {...register('address.state')}
                  placeholder="Enter state"
                />
                {errors.address?.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pinCode">PIN Code*</Label>
                <Input
                  id="pinCode"
                  {...register('address.pinCode')}
                  placeholder="Enter PIN code"
                  maxLength={6}
                />
                {errors.address?.pinCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.pinCode.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="houseNumber">House/Building No.</Label>
                <Input
                  id="houseNumber"
                  {...register('address.houseNumber')}
                  placeholder="Enter house/building number"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)*</Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms*</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                  placeholder="Number of bedrooms"
                  min={1}
                />
                {errors.bedrooms && (
                  <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms*</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                  placeholder="Number of bathrooms"
                  min={1}
                />
                {errors.bathrooms && (
                  <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="maxGuests">Maximum Guests*</Label>
              <Input
                id="maxGuests"
                type="number"
                {...register('maxGuests', { valueAsNumber: true })}
                placeholder="Maximum guests"
                min={1}
              />
              {errors.maxGuests && (
                <p className="text-red-500 text-sm mt-1">{errors.maxGuests.message}</p>
              )}
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['wifi', 'ac', 'kitchen', 'parking', 'tv'].map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={amenity}
                      {...register('amenities')}
                    />
                    <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="media">
                Photos* (Minimum 1)
              </Label>
              <MediaUploader
                value={media}
                onChange={(urls) => {
                  setMedia(urls);
                  setValue('media', urls);
                }}
              />
              {errors.media && (
                <p className="text-red-500 text-sm mt-1">{errors.media.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (isEditMode ? 'Update Property' : 'Submit Listing')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
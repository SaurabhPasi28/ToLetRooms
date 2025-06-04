// // src/app/(host)/new/page.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'react-hot-toast';
// import FormStepper from '@/components/ui/FormStepper';
// import MediaUploader from '@/components/property/MediaUploader';

// // Form Schema Validation
// const formSchema = z.object({
//   // Step 1: Basic Info
//   title: z.string().min(10, "Title must be at least 10 characters"),
//   description: z.string().min(50, "Description needs 50+ characters"),
//   propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'hostel']),
  
//   // Step 2: Address
//   address: z.object({
//     houseNumber: z.string().optional(),
//     street: z.string().min(2),
//     city: z.string().min(2),
//     state: z.string().min(2),
//     pinCode: z.string().length(6),
//     latitude: z.number().optional(),
//     longitude: z.number().optional()
//   }),
  
//   // Step 3: Details
//   price: z.number().min(500).max(100000),
//   bedrooms: z.number().min(1),
//   bathrooms: z.number().min(1),
//   maxGuests: z.number().min(1),
//   amenities: z.array(z.string()).optional(),
//   // images: z.array(z.string()).min(3, "Upload at least 3 photos")
// });

// type FormData = z.infer<typeof formSchema>;

// export default function HostPropertyForm() {
//   const [step, setStep] = useState(1);
//   const [images, setImages] = useState<string[]>([]);
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     trigger,
//     formState: { errors },
//     watch,
//     setValue
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       propertyType: 'apartment',
//       amenities: []
//     }
//   });

//   // const onSubmit = async (data: FormData) => {
//   //   try {
//   //     const response = await fetch('/api/properties', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         ...data,
//   //         images
//   //       })
//   //     });

//   //     if (response.ok) {
//   //       router.push('/host/new/success');
//   //     } else {
//   //       toast.error('Failed to create listing');
//   //     }
//   //   } catch (error) {
//   //     toast.error('An error occurred');
//   //   }
//   // };

//   const onSubmit = async (data: FormData) => {
//   setIsSubmitting(true);
//   try {
//     const response = await fetch('/api/properties', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         ...data,
//         availability: { // Add default availability
//           startDate: new Date(),
//           endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
//         }
//       })
//     });

//     const result = await response.json();
    
//     if (!response.ok) {
//       throw new Error(result.error || 'Failed to create listing');
//     }

//     router.push('/host/properties?success=true');
//   } catch (error) {
//     toast.error(error instanceof Error ? error.message : 'Submission failed');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   // Handle image upload completion
//   const handleImageUpload = (urls: string[]) => {
//     setImages(urls);
//     setValue('images', urls);
//   };

//   // Progress to next step if validation passes
//   const nextStep = async () => {
//     const fields = step === 1 
//       ? ['title', 'description', 'propertyType']
//       : step === 2
//       ? ['address']
//       : ['price', 'bedrooms', 'bathrooms', 'maxGuests', 'images'];
    
//     const isValid = await trigger(fields as any);
//     if (isValid) setStep(step + 1);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
//       <h1 className="text-2xl font-bold mb-6">List Your Property</h1>
      
//       <FormStepper currentStep={step} steps={[
//         'Basic Info', 
//         'Location', 
//         'Details'
//       ]} />

//       <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
//         {/* Step 1: Basic Information */}
//         {step === 1 && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Property Title*
//               </label>
//               <input
//                 {...register('title')}
//                 className="w-full p-2 border rounded"
//                 placeholder="e.g., Cozy apartment near college"
//               />
//               {errors.title && (
//                 <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Description*
//               </label>
//               <textarea
//                 {...register('description')}
//                 className="w-full p-2 border rounded min-h-[120px]"
//                 placeholder="Describe your property in detail..."
//               />
//               {errors.description && (
//                 <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Property Type*
//               </label>
//               <select
//                 {...register('propertyType')}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="apartment">Apartment</option>
//                 <option value="house">House</option>
//                 <option value="villa">Villa</option>
//                 <option value="pg">PG</option>
//                 <option value="hostel">Hostel</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Location */}
//         {step === 2 && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Street*
//                 </label>
//                 <input
//                   {...register('address.street')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   City*
//                 </label>
//                 <input
//                   {...register('address.city')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   State*
//                 </label>
//                 <input
//                   {...register('address.state')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   PIN Code*
//                 </label>
//                 <input
//                   {...register('address.pinCode')}
//                   className="w-full p-2 border rounded"
//                   maxLength={6}
//                 />
//               </div>
//             </div>

//             {/* Map Integration Placeholder */}
//             <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//               <p>Map will appear here for location selection</p>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Details */}
//         {step === 3 && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Price (₹)*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('price', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Bedrooms*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('bedrooms', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                   min={1}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Bathrooms*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('bathrooms', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                   min={1}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Maximum Guests*
//               </label>
//               <input
//                 type="number"
//                 {...register('maxGuests', { valueAsNumber: true })}
//                 className="w-full p-2 border rounded"
//                 min={1}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Amenities
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {['wifi', 'ac', 'kitchen', 'parking', 'tv'].map(amenity => (
//                   <label key={amenity} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       value={amenity}
//                       {...register('amenities')}
//                     />
//                     <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* <div>
//               <label className="block text-sm font-medium mb-1">
//                 Photos* (Minimum 3)
//               </label>
//               <MediaUploader/>
//               {errors.images && (
//                 <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
//               )}
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {images.map((img, i) => (
//                   <img 
//                     key={i} 
//                     src={img} 
//                     className="w-24 h-24 object-cover rounded" 
//                     alt={`Property image ${i+1}`}
//                   />
//                 ))}
//               </div>
//             </div> */}
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex justify-between pt-6">
//           {step > 1 && (
//             <button
//               type="button"
//               onClick={() => setStep(step - 1)}
//               className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//             >
//               Back
//             </button>
//           )}
          
//           {step < 3 ? (
//             <button
//               type="button"
//               onClick={nextStep}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Next
//             </button>
//           ) : (
//             // <button
//             //   type="submit"
//             //   className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//             // >
//             //   Submit Listing
//             // </button>


//             <button
//   type="submit"
//   disabled={isSubmitting}
//   className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
//     isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//   }`}
// >
//   {isSubmitting ? 'Submitting...' : 'Submit Listing'}
// </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }




// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'react-hot-toast';
// import FormStepper from '@/components/ui/FormStepper';

// const formSchema = z.object({
//   title: z.string().min(10, "Title must be at least 10 characters"),
//   description: z.string().min(50, "Description needs 50+ characters"),
//   propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'hostel']),
//   address: z.object({
//     houseNumber: z.string().optional(),
//     street: z.string().min(2),
//     city: z.string().min(2),
//     state: z.string().min(2),
//     pinCode: z.string().length(6),
//     latitude: z.number().optional(),
//     longitude: z.number().optional()
//   }),
//   price: z.number().min(500).max(100000),
//   bedrooms: z.number().min(1),
//   bathrooms: z.number().min(1),
//   maxGuests: z.number().min(1),
//   amenities: z.array(z.string()).optional()
// });

// type FormData = z.infer<typeof formSchema>;

// export default function HostPropertyForm() {
//   const [step, setStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     trigger,
//     formState: { errors },
//     setValue
//   } = useForm<FormData>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       propertyType: 'apartment',
//       amenities: [],
//       address: {
//         latitude: 0,
//         longitude: 0
//       }
//     }
//   });

//   const onSubmit = async (data: FormData) => {
//     setIsSubmitting(true);
//     try {
//       const response = await fetch('/api/properties', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...data,
//           availability: {
//             startDate: new Date(),
//             endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
//           }
//         })
//       });

//       const result = await response.json();
      
//       if (!response.ok) throw new Error(result.error || 'Submission failed');

//       toast.success('Property listed successfully!');
//       router.push('/host/properties');
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Submission failed');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const nextStep = async () => {
//     const fields = step === 1 
//       ? ['title', 'description', 'propertyType']
//       : step === 2
//       ? ['address']
//       : ['price', 'bedrooms', 'bathrooms', 'maxGuests'];
    
//     const isValid = await trigger(fields as any);
//     if (isValid) setStep(step + 1);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
//       <h1 className="text-2xl font-bold mb-6">List Your Property</h1>
      
//       <FormStepper currentStep={step} steps={['Basic Info', 'Location', 'Details']} />

//       <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
//         {/* Form steps remain the same as your original */}
//         {/* Step 1: Basic Information */}
//         {step === 1 && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Property Title*
//               </label>
//               <input
//                 {...register('title')}
//                 className="w-full p-2 border rounded"
//                 placeholder="e.g., Cozy apartment near college"
//               />
//               {errors.title && (
//                 <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Description*
//               </label>
//               <textarea
//                 {...register('description')}
//                 className="w-full p-2 border rounded min-h-[120px]"
//                 placeholder="Describe your property in detail..."
//               />
//               {errors.description && (
//                 <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Property Type*
//               </label>
//               <select
//                 {...register('propertyType')}
//                 className="w-full p-2 border rounded"
//               >
//                 <option value="apartment">Apartment</option>
//                 <option value="house">House</option>
//                 <option value="villa">Villa</option>
//                 <option value="pg">PG</option>
//                 <option value="hostel">Hostel</option>
//               </select>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Location */}
//         {step === 2 && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Street*
//                 </label>
//                 <input
//                   {...register('address.street')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   City*
//                 </label>
//                 <input
//                   {...register('address.city')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   State*
//                 </label>
//                 <input
//                   {...register('address.state')}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   PIN Code*
//                 </label>
//                 <input
//                   {...register('address.pinCode')}
//                   className="w-full p-2 border rounded"
//                   maxLength={6}
//                 />
//               </div>
//             </div>

//             {/* Map Integration Placeholder */}
//             <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
//               <p>Map will appear here for location selection</p>
//             </div>
//           </div>
//         )}

//         {/* Step 3: Details */}
//         {step === 3 && (
//           <div className="space-y-4">
//             <div className="grid grid-cols-3 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Price (₹)*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('price', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Bedrooms*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('bedrooms', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                   min={1}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Bathrooms*
//                 </label>
//                 <input
//                   type="number"
//                   {...register('bathrooms', { valueAsNumber: true })}
//                   className="w-full p-2 border rounded"
//                   min={1}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Maximum Guests*
//               </label>
//               <input
//                 type="number"
//                 {...register('maxGuests', { valueAsNumber: true })}
//                 className="w-full p-2 border rounded"
//                 min={1}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Amenities
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {['wifi', 'ac', 'kitchen', 'parking', 'tv'].map(amenity => (
//                   <label key={amenity} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       value={amenity}
//                       {...register('amenities')}
//                     />
//                     <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* <div>
//               <label className="block text-sm font-medium mb-1">
//                 Photos* (Minimum 3)
//               </label>
//               <MediaUploader/>
//               {errors.images && (
//                 <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
//               )}
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {images.map((img, i) => (
//                   <img 
//                     key={i} 
//                     src={img} 
//                     className="w-24 h-24 object-cover rounded" 
//                     alt={`Property image ${i+1}`}
//                   />
//                 ))}
//               </div>
//             </div> */}
//           </div>
//         )}

//         {/* Navigation Buttons */}

//         <div className="flex justify-between pt-6">
//           {step > 1 && (
//             <button
//               type="button"
//               onClick={() => setStep(step - 1)}
//               className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//             >
//               Back
//             </button>
//           )}
          
//           {step < 3 ? (
//             <button
//               type="button"
//               onClick={nextStep}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
//                 isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {isSubmitting ? 'Submitting...' : 'Submit Listing'}
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {FormStepper }from '@/components/ui/FormStepper';
import MediaUploader from '@/components/property/MediaUploader';
import { PropertyFormProps } from '@/types/next-auth';

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

// interface PropertyFormProps {
//   initialData?: any;
//   isEditMode?: boolean;
// }

type FormData = z.infer<typeof formSchema>;

export default function HostPropertyForm({ initialData,isEditMode = false }:any) {
  const [step, setStep] = useState(1);
  // const isEditMode = !!initialData;
  const [media, setMedia] = useState<string[]>(initialData?.media || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    // watch,
    // reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: 'apartment',
      amenities: [],
      address: {
        areaOrLocality: ''
      }
    }
  });
  // const media = watch('media') || [];

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
        router.push('/host/properties');
      }
    } catch (error: any) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields: string[] = step === 1 
      ? ['title', 'description', 'propertyType']
      : step === 2
      ? ['address.street', 'address.city', 'address.state', 'address.pinCode']
      : ['price', 'bedrooms', 'bathrooms', 'maxGuests'];
    
    // const isValid = await trigger(fields);
    // if (isValid) setStep(step + 1);
    setStep(step + 1);
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
              <label className="block text-sm font-medium mb-1">Property Title*</label>
              <input
                {...register('title')}
                className="w-full p-2 border rounded"
                placeholder="e.g., Cozy apartment near college"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description*</label>
              <textarea
                {...register('description')}
                className="w-full p-2 border rounded min-h-[120px]"
                placeholder="Describe your property in detail..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Property Type*</label>
              <select
                {...register('propertyType')}
                className="w-full p-2 border rounded"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street*</label>
                <input
                  {...register('address.street')}
                  className="w-full p-2 border rounded"
                />
                {errors.address?.street && <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Locality/Area</label>
                <input
                  {...register('address.areaOrLocality')}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City*</label>
                <input
                  {...register('address.city')}
                  className="w-full p-2 border rounded"
                />
                {errors.address?.city && <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State*</label>
                <input
                  {...register('address.state')}
                  className="w-full p-2 border rounded"
                />
                {errors.address?.state && <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">PIN Code*</label>
                <input
                  {...register('address.pinCode')}
                  className="w-full p-2 border rounded"
                  maxLength={6}
                />
                {errors.address?.pinCode && <p className="text-red-500 text-sm mt-1">{errors.address.pinCode.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">House/Building No.</label>
                <input
                  {...register('address.houseNumber')}
                  className="w-full p-2 border rounded"
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
                <label className="block text-sm font-medium mb-1">Price (₹)*</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full p-2 border rounded"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms*</label>
                <input
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                  className="w-full p-2 border rounded"
                  min={1}
                />
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms*</label>
                <input
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                  className="w-full p-2 border rounded"
                  min={1}
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Maximum Guests*</label>
              <input
                type="number"
                {...register('maxGuests', { valueAsNumber: true })}
                className="w-full p-2 border rounded"
                min={1}
              />
              {errors.maxGuests && <p className="text-red-500 text-sm mt-1">{errors.maxGuests.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amenities</label>
              <div className="flex flex-wrap gap-2">
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
  <label className="block text-sm font-medium mb-1">
    Photos* (Minimum 1)
  </label>
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
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Listing'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
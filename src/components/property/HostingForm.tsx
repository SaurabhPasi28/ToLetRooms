// // components/property/HostingForm.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { toast } from 'react-hot-toast';

// const formSchema = z.object({
//   // Step 1: Basic Info
//   title: z.string().min(10),
//   description: z.string().min(50),
//   propertyType: z.enum(['apartment', 'house', 'villa']),
  
//   // Step 2: Address
//   address: z.object({
//     city: z.string().min(2),
//     pincode: z.string().length(6),
//     // ...other address fields
//   }),
  
//   // Step 3: Details
//   price: z.number().min(500),
//   bedrooms: z.number().min(1),
//   // ...other fields
// });

// export default function HostingForm() {
//   const [step, setStep] = useState(1);
//   const router = useRouter();
  
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       // Initialize with empty values
//     }
//   });

//   const onSubmit = async (data) => {
//     try {
//       const res = await fetch('/api/properties', {
//         method: 'POST',
//         body: JSON.stringify(data)
//       });
      
//       if (res.ok) {
//         router.push('/host/new/success');
//       }
//     } catch (error) {
//       toast.error('Failed to create listing');
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <FormStepper currentStep={step} />
      
//       <form onSubmit={form.handleSubmit(onSubmit)}>
//         {step === 1 && <BasicInfoStep form={form} />}
//         {step === 2 && <AddressStep form={form} />}
//         {step === 3 && <DetailsStep form={form} />}
        
//         <div className="flex justify-between mt-8">
//           {step > 1 && (
//             <button 
//               type="button" 
//               onClick={() => setStep(step - 1)}
//               className="btn-secondary"
//             >
//               Back
//             </button>
//           )}
          
//           {step < 3 ? (
//             <button 
//               type="button" 
//               onClick={() => form.trigger().then(isValid => isValid && setStep(step + 1))}
//               className="btn-primary"
//             >
//               Next
//             </button>
//           ) : (
//             <button type="submit" className="btn-primary">
//               Submit Listing
//             </button>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }
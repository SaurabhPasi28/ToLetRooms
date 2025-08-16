'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Path } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import MediaUploader from '@/components/property/MediaUploader';
import { FormStepper } from '@/components/ui/FormStepper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
	title: z.string().min(10, 'Title must be at least 10 characters'),
	description: z.string().min(50, 'Description needs 50+ characters'),
	propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'hostel']),
	address: z.object({
		houseNumber: z.string().optional(),
		buildingName: z.string().optional(),
		street: z.string().min(2, 'Street is required'),
		landmark: z.string().optional(),
		areaOrLocality: z.string().optional(),
		city: z.string().min(2, 'City is required'),
		state: z.string().min(2, 'State is required'),
		pinCode: z.string().length(6, 'PIN code must be 6 digits')
	}),
	price: z.number().min(500, 'Minimum price is ₹500').max(100000, 'Maximum price is ₹100,000'),
	bedrooms: z.number().min(1, 'At least 1 bedroom'),
	bathrooms: z.number().min(1, 'At least 1 bathroom'),
	maxGuests: z.number().min(1, 'At least 1 guest'),
	amenities: z.array(z.string()).optional(),
	media: z.array(z.string().url()).min(1, 'At least 1 image is required')
});

type FormData = z.infer<typeof formSchema>;

export default function PropertyForm({
	initialData,
	isEditMode = false
}: {
	initialData?: any;
	isEditMode?: boolean;
}) {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [media, setMedia] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
				houseNumber: '',
				buildingName: '',
				landmark: ''
			}
		}
	});

	useEffect(() => {
		if (initialData && isEditMode) {
			const defaults: FormData = {
				title: initialData.title || '',
				description: initialData.description || '',
				propertyType: initialData.propertyType || 'apartment',
				address: {
					houseNumber: initialData.address?.houseNumber || '',
					buildingName: initialData.address?.buildingName || '',
					street: initialData.address?.street || '',
					landmark: initialData.address?.landmark || '',
					areaOrLocality: initialData.address?.areaOrLocality || '',
					city: initialData.address?.city || '',
					state: initialData.address?.state || '',
					pinCode: initialData.address?.pinCode || ''
				},
				price: Number(initialData.price || 0),
				bedrooms: Number(initialData.bedrooms || 1),
				bathrooms: Number(initialData.bathrooms || 1),
				maxGuests: Number(initialData.maxGuests || 1),
				amenities: Array.isArray(initialData.amenities) ? initialData.amenities : [],
				media: Array.isArray(initialData.media) ? initialData.media : []
			};
			reset(defaults);
			setMedia(Array.isArray(initialData.media) ? initialData.media : []);
		}
	}, [initialData, isEditMode, reset]);

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			const url = isEditMode ? `/api/properties/${initialData._id}` : '/api/properties';
			const method = isEditMode ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...data, media })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err?.error || 'Submission failed');
			}

			toast.success(isEditMode ? 'Property updated!' : 'Property listed!');
			router.push('/properties/listed');
		} catch (e: any) {
			toast.error(e?.message || 'Submission failed');
		} finally {
			setIsSubmitting(false);
		}
	};

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
		const fields: Path<FormData>[] =
			step === 1
				? ['title', 'description', 'propertyType']
				: step === 2
				? [
						'address.houseNumber',
						'address.buildingName',
						'address.street',
						'address.landmark',
						'address.areaOrLocality',
						'address.city',
						'address.state',
						'address.pinCode'
				  ]
				: ['price', 'bedrooms', 'bathrooms', 'maxGuests'];

		const ok = await trigger(fields);
		if (ok) setStep((s) => s + 1);
	};

	const prevStep = () => {
		if (step > 1) setStep((s) => s - 1);
	};

	return (
		<div className="max-w-5xl mx-auto p-4 sm:p-6">
			{/* Header */}
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						{isEditMode ? 'Edit Property' : 'List Your Property'}
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Provide accurate details so guests can find and love your place.
					</p>
				</div>
				<div className="hidden sm:block">
					<FormStepper currentStep={step} steps={['Basic Info', 'Location', 'Details']} />
				</div>
			</div>

			{/* Stepper (mobile) */}
			<div className="sm:hidden mb-4">
				<FormStepper currentStep={step} steps={['1', '2', '3']} />
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Step 1: Basic Info */}
				{step === 1 && (
					<section className="bg-card border border-border rounded-xl shadow-sm">
						<div className="p-4 sm:p-6 border-b border-border">
							<h2 className="text-lg font-semibold text-foreground">Basic information</h2>
							<p className="text-sm text-muted-foreground">Title, description and type.</p>
						</div>
						<div className="p-4 sm:p-6 grid grid-cols-1 gap-4">
							<div className="space-y-1.5">
								<Label htmlFor="title">Property Title<span className="text-destructive">*</span></Label>
								<Input
									id="title"
									{...register('title')}
									placeholder="e.g., Cozy apartment near college"
								/>
								{errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="description">Description<span className="text-destructive">*</span></Label>
								<Textarea
									id="description"
									{...register('description')}
									placeholder="Describe your property in detail..."
									rows={4}
								/>
								{errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="propertyType">Property Type<span className="text-destructive">*</span></Label>
								<select
									id="propertyType"
									{...register('propertyType')}
									className="w-full p-2 rounded-md border border-input bg-background text-foreground"
								>
									<option value="apartment">Apartment</option>
									<option value="house">House</option>
									<option value="villa">Villa</option>
									<option value="pg">PG</option>
									<option value="hostel">Hostel</option>
								</select>
								{errors.propertyType && <p className="text-destructive text-xs">{errors.propertyType.message}</p>}
							</div>
						</div>
					</section>
				)}

				{/* Step 2: Location */}
				{step === 2 && (
					<section className="bg-card border border-border rounded-xl shadow-sm">
						<div className="p-4 sm:p-6 border-b border-border">
							<h2 className="text-lg font-semibold text-foreground">Location</h2>
							<p className="text-sm text-muted-foreground">Exact address improves search visibility.</p>
						</div>
						<div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-1.5">
								<Label htmlFor="houseNumber">House/Flat No.</Label>
								<Input id="houseNumber" {...register('address.houseNumber')} placeholder="A-302" />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="buildingName">Building Name</Label>
								<Input id="buildingName" {...register('address.buildingName')} placeholder="Sunrise Residency" />
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="street">Street<span className="text-destructive">*</span></Label>
								<Input id="street" {...register('address.street')} placeholder="MG Road" />
								{errors.address?.street && <p className="text-destructive text-xs">{errors.address.street.message}</p>}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="landmark">Landmark</Label>
								<Input id="landmark" {...register('address.landmark')} placeholder="Near City Mall" />
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="areaOrLocality">Locality/Area</Label>
								<Input id="areaOrLocality" {...register('address.areaOrLocality')} placeholder="Andheri West" />
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="city">City<span className="text-destructive">*</span></Label>
								<Input id="city" {...register('address.city')} placeholder="Mumbai" />
								{errors.address?.city && <p className="text-destructive text-xs">{errors.address.city.message}</p>}
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="state">State<span className="text-destructive">*</span></Label>
								<Input id="state" {...register('address.state')} placeholder="Maharashtra" />
								{errors.address?.state && <p className="text-destructive text-xs">{errors.address.state.message}</p>}
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="pinCode">PIN Code<span className="text-destructive">*</span></Label>
								<Input id="pinCode" {...register('address.pinCode')} placeholder="400001" maxLength={6} />
								{errors.address?.pinCode && <p className="text-destructive text-xs">{errors.address.pinCode.message}</p>}
							</div>
						</div>
					</section>
				)}

				{/* Step 3: Details */}
				{step === 3 && (
					<section className="bg-card border border-border rounded-xl shadow-sm">
						<div className="p-4 sm:p-6 border-b border-border">
							<h2 className="text-lg font-semibold text-foreground">Details & media</h2>
							<p className="text-sm text-muted-foreground">Pricing, capacity and photos.</p>
						</div>
						<div className="p-4 sm:p-6 grid grid-cols-1 gap-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="price">Price (₹)<span className="text-destructive">*</span></Label>
									<Input
										id="price"
										type="number"
										{...register('price', { valueAsNumber: true })}
										placeholder="e.g., 2500"
									/>
									{errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="bedrooms">Bedrooms<span className="text-destructive">*</span></Label>
									<Input
										id="bedrooms"
										type="number"
										{...register('bedrooms', { valueAsNumber: true })}
										min={1}
										placeholder="e.g., 2"
									/>
									{errors.bedrooms && <p className="text-destructive text-xs">{errors.bedrooms.message}</p>}
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="bathrooms">Bathrooms<span className="text-destructive">*</span></Label>
									<Input
										id="bathrooms"
										type="number"
										{...register('bathrooms', { valueAsNumber: true })}
										min={1}
										placeholder="e.g., 1"
									/>
									{errors.bathrooms && <p className="text-destructive text-xs">{errors.bathrooms.message}</p>}
								</div>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="maxGuests">Maximum Guests<span className="text-destructive">*</span></Label>
								<Input
									id="maxGuests"
									type="number"
									{...register('maxGuests', { valueAsNumber: true })}
									min={1}
									placeholder="e.g., 4"
								/>
								{errors.maxGuests && <p className="text-destructive text-xs">{errors.maxGuests.message}</p>}
							</div>

							<div className="space-y-2">
								<Label>Included Amenities</Label>
								<div className="flex flex-wrap gap-2">
									{['wifi', 'ac', 'kitchen', 'parking', 'tv'].map((a) => (
										<label key={a} className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
											<input type="checkbox" value={a} {...register('amenities')} />
											<span className="capitalize">{a}</span>
										</label>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="media">Photos<span className="text-destructive">*</span> <span className="text-muted-foreground text-xs">(Minimum 1)</span></Label>
								<MediaUploader
									value={media}
									onChange={(urls) => {
										setMedia(urls);
										setValue('media', urls as any);
									}}
								/>
								{errors.media && <p className="text-destructive text-xs">{errors.media.message}</p>}
							</div>
						</div>
					</section>
				)}

				{/* Actions */}
				<div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border py-3">
					<div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
						<div className="text-xs text-muted-foreground">
							<span className="font-medium text-foreground">Step {step} of 3</span> • All fields marked with <span className="text-destructive">*</span> are required
						</div>
						<div className="flex items-center gap-2">
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
									{isSubmitting ? 'Submitting...' : isEditMode ? 'Update Property' : 'Submit Listing'}
								</Button>
							)}
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}
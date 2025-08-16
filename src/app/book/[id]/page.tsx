"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DateRange } from 'react-day-picker';
import BookingWidget from '@/components/booking/BookingWidget';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import BookingSummary from '@/components/booking/BookingSummary';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

// Property type that matches what the API returns and components expect
interface BookingProperty {
  _id: string;
  title: string;
  description?: string;
  media: Array<{ url: string; type: 'image' | 'video' }> | string[];
  price: number;
  propertyType?: string;
  address: { 
    street?: string; 
    city: string; 
    state: string; 
    pinCode?: string;
    areaOrLocality?: string;
    houseNumber?: string;
    buildingName?: string;
  };
  amenities?: string[];
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  host?: { 
    _id: string; 
    name?: string; 
    email?: string; 
    phone?: string; 
    avatar?: string | null;
  };
  isActive?: boolean;
}

export default function BookPropertyPage() {
	const params = useParams();
	const propertyId = params?.id as string;

	const [property, setProperty] = useState<BookingProperty | null>(null);
	const [loading, setLoading] = useState(true);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
	const [guests, setGuests] = useState(1);
	const [step, setStep] = useState<'select' | 'confirm'>('select');
	const [user, setUser] = useState<User | null>(null);
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

	useEffect(() => {
		async function fetchProperty() {
			setLoading(true);
			try {
				const res = await fetch(`/api/properties/${propertyId}`);
				if (!res.ok) throw new Error('Property not found');
				const data = await res.json();
				const fetchedProperty = data.property || data;
				
				// Validate that we have required fields
				if (!fetchedProperty._id) {
					throw new Error('Property data incomplete');
				}

				// Normalize media to ensure consistent format
				const normalizedMedia = Array.isArray(fetchedProperty.media)
					? fetchedProperty.media.map((item: any) => 
						typeof item === 'string' 
							? { 
								url: item, 
								type: /\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i.test(item) ? 'video' as const : 'image' as const 
							}
							: item
					)
					: [];

				setProperty({
					...fetchedProperty,
					media: normalizedMedia,
					address: {
						city: fetchedProperty.address?.city || '',
						state: fetchedProperty.address?.state || '',
						...fetchedProperty.address
					}
				});
			} catch (err) {
				console.log('Failed to load property', err);
				toast.error('Failed to load property');
			} finally {
				setLoading(false);
			}
		}
		if (propertyId) fetchProperty();
	}, [propertyId]);

	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await fetch('/api/profile');
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
				}
			} catch (error) {
				console.log('Failed to fetch user', error);
			}
		}
		fetchUser();
	}, []);

	useEffect(() => {
		async function checkAvailability() {
			if (!dateRange?.from || !dateRange?.to || !propertyId) return;
			try {
				const params = new URLSearchParams({
					checkIn: dateRange.from.toISOString(),
					checkOut: dateRange.to.toISOString()
				}).toString();
				const res = await fetch(`/api/properties/${propertyId}/availability?${params}`);
				const data = await res.json();
				setIsAvailable(data.isAvailable ?? true);
				if (data.isAvailable === false) {
					toast.error('Selected dates are not available');
				}
			} catch (error) {
				console.log('Failed to check availability', error);
			}
		}
		checkAvailability();
	}, [dateRange?.from, dateRange?.to, propertyId]);

	if (loading) return <div className="p-8 text-center">Loading...</div>;
	if (!property) return <div className="p-8 text-center text-red-500">Property not found.</div>;

	return (
		<div className="w-full mx-auto px-16 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
			<div>
				<BookingSummary property={property} />
			</div>
			<div>
				{step === 'select' && (
					<>
						<BookingWidget
							price={property.price}
							dateRange={dateRange}
							onDateChange={setDateRange}
							guests={guests}
							onGuestsChange={setGuests}
							maxGuests={property.maxGuests}
						/>
						<button
							className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
							disabled={!dateRange?.from || !dateRange?.to || isAvailable === false}
							onClick={() => setStep('confirm')}
						>
							Continue to confirmation
						</button>
					</>
				)}
				{step === 'confirm' && user && dateRange?.from && dateRange?.to && (
					<BookingConfirmation
						property={{
							_id: property._id,
							title: property.title,
							media: property.media as Array<{ url: string; type: 'image' | 'video' }>,
							price: property.price,
							address: {
								street: property.address.street,
								city: property.address.city,
								state: property.address.state,
							},
							maxGuests: property.maxGuests,
							amenities: property.amenities,
						}}
						checkIn={dateRange.from}
						checkOut={dateRange.to}
						guests={guests}
						user={user}
					/>
				)}
				{step === 'confirm' && !user && (
					<div className="text-center text-red-500">You must be logged in to book.</div>
				)}
				{step === 'confirm' && (
					<button
						className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
						onClick={() => setStep('select')}
					>
						Back
					</button>
				)}
			</div>
		</div>
	);
}
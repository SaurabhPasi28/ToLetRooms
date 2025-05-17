'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DateRange } from 'react-date-range'
import { format } from 'date-fns'
import GuestSelector from './GuestSelector'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default function SearchBar({ variant = 'default' }: { variant?: 'default' | 'hero' }) {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGuestPicker, setShowGuestPicker] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    key: 'selection'
  })
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0
  })

  const handleSearch = () => {
    const queryParams = new URLSearchParams()
    if (location) queryParams.append('location', location)
    queryParams.append('checkIn', format(dateRange.startDate, 'yyyy-MM-dd'))
    queryParams.append('checkOut', format(dateRange.endDate, 'yyyy-MM-dd'))
    queryParams.append('adults', guests.adults.toString())
    queryParams.append('children', guests.children.toString())
    router.push(`/search?${queryParams.toString()}`)
  }

  return (
    <div className={`${variant === 'hero' ? 'bg-white p-4 rounded-lg shadow-xl' : 'border rounded-full p-2'} flex flex-col md:flex-row items-center`}>
      {/* Location */}
      <div className={`${variant === 'hero' ? 'border-r' : 'border rounded-full'} px-4 py-2 w-full md:w-auto`}>
        <div className="text-xs font-semibold">Where</div>
        <input
          type="text"
          placeholder="Search destinations"
          className="outline-none bg-transparent w-full"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* Check-in */}
      <div 
        className={`${variant === 'hero' ? 'border-r' : 'border rounded-full'} px-4 py-2 cursor-pointer w-full md:w-auto`}
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <div className="text-xs font-semibold">Check in</div>
        <div>{format(dateRange.startDate, 'MMM dd')}</div>
      </div>

      {/* Check-out */}
      <div 
        className={`${variant === 'hero' ? 'border-r' : 'border rounded-full'} px-4 py-2 cursor-pointer w-full md:w-auto`}
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        <div className="text-xs font-semibold">Check out</div>
        <div>{format(dateRange.endDate, 'MMM dd')}</div>
      </div>

      {/* Guests */}
      <div 
        className={`${variant === 'hero' ? '' : 'border rounded-full'} px-4 py-2 cursor-pointer flex items-center justify-between w-full md:w-auto`}
        onClick={() => setShowGuestPicker(!showGuestPicker)}
      >
        <div>
          <div className="text-xs font-semibold">Who</div>
          <div className="text-sm">
            {guests.adults + guests.children} guest{guests.adults + guests.children !== 1 ? 's' : ''}
            {guests.infants > 0 && `, ${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`}
            {guests.pets > 0 && `, ${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div className="bg-rose-500 p-2 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Date Picker Popover */}
      {showDatePicker && (
        <div className="absolute top-[120%] left-1/2 transform -translate-x-1/2 z-50 shadow-xl rounded-lg bg-white">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setDateRange(item.selection)}
            moveRangeOnFirstSelection={false}
            ranges={[dateRange]}
            minDate={new Date()}
          />
          <div className="flex justify-between p-4 border-t">
            <button 
              className="text-gray-500 underline"
              onClick={() => setShowDatePicker(false)}
            >
              Cancel
            </button>
            <button 
              className="bg-rose-500 text-white px-4 py-2 rounded-lg"
              onClick={() => setShowDatePicker(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Guest Picker Popover */}
      {showGuestPicker && (
        <GuestSelector 
          guests={guests}
          onChange={setGuests}
          onClose={() => setShowGuestPicker(false)}
        />
      )}

      {/* Search Button - Mobile */}
      {variant === 'default' && (
        <button 
          className="md:hidden bg-rose-500 text-white px-6 py-3 rounded-full w-full mt-2"
          onClick={handleSearch}
        >
          Search
        </button>
      )}
    </div>
  )
}
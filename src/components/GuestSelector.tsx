'use client'
// import { useState } from 'react'

export default function GuestSelector({
  guests,
  onChange,
  onClose
}: {
  guests: { adults: number; children: number; infants: number; pets: number }
  onChange: (guests: typeof guests) => void
  onClose: () => void
}) {
  const updateCount = (type: keyof typeof guests, value: number) => {
    const newValue = guests[type] + value
    if (newValue >= 0) {
      onChange({
        ...guests,
        [type]: newValue
      })
    }
  }

  return (
    <div className="absolute top-[120%] right-0 w-72 bg-white shadow-xl rounded-lg z-50 p-4">
      <div className="space-y-6">
        {/* Adults */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Adults</div>
            <div className="text-sm text-gray-500">Ages 13 or above</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('adults', -1)}
              disabled={guests.adults <= 1}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${guests.adults <= 1 ? 'text-gray-300' : ''}`}
            >
              -
            </button>
            <span>{guests.adults}</span>
            <button
              onClick={() => updateCount('adults', 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Children</div>
            <div className="text-sm text-gray-500">Ages 2-12</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('children', -1)}
              disabled={guests.children <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${guests.children <= 0 ? 'text-gray-300' : ''}`}
            >
              -
            </button>
            <span>{guests.children}</span>
            <button
              onClick={() => updateCount('children', 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Infants</div>
            <div className="text-sm text-gray-500">Under 2</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('infants', -1)}
              disabled={guests.infants <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${guests.infants <= 0 ? 'text-gray-300' : ''}`}
            >
              -
            </button>
            <span>{guests.infants}</span>
            <button
              onClick={() => updateCount('infants', 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Pets */}
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">Pets</div>
            <div className="text-sm text-gray-500">Service animals?</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateCount('pets', -1)}
              disabled={guests.pets <= 0}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${guests.pets <= 0 ? 'text-gray-300' : ''}`}
            >
              -
            </button>
            <span>{guests.pets}</span>
            <button
              onClick={() => updateCount('pets', 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
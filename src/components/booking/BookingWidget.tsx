'use client';

import { Calendar, Minus, Plus, User,Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface BookingWidgetProps {
  price: number;
  dateRange: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  maxGuests: number;
}

export default function BookingWidget({
  price,
  dateRange,
  onDateChange,
  guests,
  onGuestsChange,
  maxGuests,
}: BookingWidgetProps) {
  const calculateTotal = () => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    const nights = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * price;
  };

  // Add helper and wrap onSelect to enforce min 1 night
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  const handleSelect = (selected: DateRange | undefined) => {
    if (!selected) return onDateChange(undefined);
    if (selected.from && !selected.to) {
      onDateChange({ from: selected.from, to: addDays(selected.from, 1) });
    } else {
      onDateChange(selected);
    }
  };

  return (
    <div className="border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-2xl font-bold">₹{price}</p>
          <p className="text-muted-foreground">per night</p>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>4.8</span>
          <span className="text-muted-foreground">(24)</span>
        </div>
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !dateRange?.from && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                format(dateRange.from, 'MMM dd')
              ) : (
                <span>Check in</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !dateRange?.to && 'text-muted-foreground'
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange?.to ? (
                format(dateRange.to, 'MMM dd')
              ) : (
                <span>Check out</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={{ before: dateRange?.from || new Date() }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests Selector */}
      <div className="border rounded-lg p-4 mb-6">
        <p className="font-medium mb-2">Guests</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onGuestsChange(Math.max(1, guests - 1))}
              disabled={guests <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span>{guests}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onGuestsChange(Math.min(maxGuests, guests + 1))}
              disabled={guests >= maxGuests}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Book button */}
      <Button className="w-full" size="lg" disabled={!dateRange?.from || !dateRange?.to}>
        Book now
      </Button>

      {/* Price breakdown */}
      {dateRange?.from && dateRange?.to && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ₹{price} × {Math.ceil(
                (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
              )} nights
            </span>
            <span>₹{calculateTotal()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>₹{Math.round(calculateTotal() * 0.12)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{calculateTotal() + Math.round(calculateTotal() * 0.12)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
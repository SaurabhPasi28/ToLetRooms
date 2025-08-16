import mongoose from 'mongoose';

const guestInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  idType: { type: String, enum: ['passport', 'national_id', 'drivers_license', 'none'], default: 'none' },
  idNumber: { type: String },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out', 'no_show'], 
    required: true 
  },
  at: { type: Date, default: Date.now },
  byRole: { type: String, enum: ['tenant', 'host', 'system'], default: 'system' },
  byUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String },
  reason: { type: String }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Booking Details
  checkIn: {
    type: Date,
    required: true,
    index: true
  },
  checkOut: {
    type: Date,
    required: true,
    index: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Guest Information (made optional for backwards compatibility)
  guestInfo: {
    type: guestInfoSchema,
    required: false
  },
  
  // Special Requests
  specialRequests: {
    type: String,
    maxlength: 1000
  },
  
  // Pricing
  basePrice: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  cleaningFee: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  totalPrice: {
    type: Number,
    required: true
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank_transfer', 'cash', 'wallet']
  },
  paymentIntentId: String,
  refundAmount: { type: Number, default: 0 },
  
  // Status and History
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'checked_in', 'checked_out', 'no_show'],
    default: 'pending',
    index: true
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: function() {
      return [{
        status: 'pending',
        byRole: 'tenant',
        at: new Date(),
        note: 'Booking created'
      }];
    }
  },
  
  // Communication
  hostNotes: {
    type: String,
    maxlength: 1000
  },
  guestNotes: {
    type: String,
    maxlength: 1000
  },
  
  // Check-in/out
  actualCheckIn: Date,
  actualCheckOut: Date,
  earlyCheckin: { type: Boolean, default: false },
  lateCheckout: { type: Boolean, default: false },
  
  // Ratings and Reviews
  hostRating: { type: Number, min: 1, max: 5 },
  guestRating: { type: Number, min: 1, max: 5 },
  hostReview: { type: String, maxlength: 1000 },
  guestReview: { type: String, maxlength: 1000 },
  
  // Cancellation
  cancellationReason: String,
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,
  
  // New fields for better management
  bookingCode: {
    type: String,
    unique: true,
    default: function() {
      return 'BK' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  reminderSent: { type: Boolean, default: false },
  confirmationSent: { type: Boolean, default: false }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
bookingSchema.virtual('nights').get(function() {
  return Math.ceil((this.checkOut.getTime() - this.checkIn.getTime()) / (1000 * 60 * 60 * 24));
});

bookingSchema.virtual('isUpcoming').get(function() {
  return this.checkIn > new Date() && ['confirmed', 'pending'].includes(this.status);
});

bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.checkIn <= now && this.checkOut > now && ['confirmed', 'checked_in'].includes(this.status);
});

bookingSchema.virtual('isPast').get(function() {
  return this.checkOut < new Date() || ['completed', 'checked_out'].includes(this.status);
});

bookingSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status) && this.checkIn > new Date();
});

// Helper method to get guest info (backwards compatible)
bookingSchema.virtual('guestDetails').get(function() {
  if (this.guestInfo) {
    return this.guestInfo;
  }
  // Fallback to user info for old bookings
  const user = this.populated('user') || this.user;
  return {
    name: user?.name || 'Unknown Guest',
    email: user?.email || 'no-email@example.com',
    phone: user?.phone || 'No phone'
  };
});

// Indexes for performance
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ bookingCode: 1 });
bookingSchema.index({ 'guestInfo.email': 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Auto-calculate total price
  if (this.isModified('basePrice') || this.isModified('serviceFee') || this.isModified('cleaningFee') || this.isModified('taxes')) {
    this.totalPrice = (this.basePrice || 0) + (this.serviceFee || 0) + (this.cleaningFee || 0) + (this.taxes || 0);
  }
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
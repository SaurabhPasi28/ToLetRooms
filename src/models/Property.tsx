// // models/Property.ts
// import mongoose, { Schema } from "mongoose";

// // Address Sub-Schema
// const addressSchema = new mongoose.Schema({
//   houseNumber: { type: String, trim: true },
//   buildingName: { type: String, trim: true },
//   street: { type: String, required: [true, 'Street is required'], trim: true },
//   landmark: { type: String, trim: true },
//   areaOrLocality: { type: String, required: [true, 'Locality is required'], trim: true },
//   city: { type: String, required: [true, 'City is required'], trim: true },
//   state: { type: String, required: [true, 'State is required'], trim: true },
//   pinCode: { 
//     type: String, 
//     required: [true, 'PIN code is required'],
//     validate: {
//       validator: (v: string) => /^\d{6}$/.test(v),
//       message: 'PIN code must be 6 digits'
//     },
//     trim: true
//   },
//   country: { 
//     type: String, 
//     default: "India",
//     trim: true 
//   },
//   coordinates: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number],  // [longitude, latitude]
//       required: true,
//       validate: {
//         validator: (v: number[]) => v.length === 2,
//         message: 'Coordinates must be an array of [longitude, latitude]'
//       }
//     }
//   }
// }, { _id: false });

// // Main Property Schema
// const propertySchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: [true, 'Title is required'], 
//     minlength: [10, 'Title must be at least 10 characters'],
//     maxlength: [100, 'Title cannot exceed 100 characters'],
//     trim: true
//   },
//   description: { 
//     type: String, 
//     required: [true, 'Description is required'], 
//     minlength: [50, 'Description must be at least 50 characters'],
//     maxlength: [2000, 'Description cannot exceed 2000 characters'],
//     trim: true
//   },
//   price: { 
//     type: Number, 
//     required: [true, 'Price is required'],
//     min: [500, 'Minimum price is ₹500'],
//     max: [100000, 'Maximum price is ₹100,000'],
//     set: (v: number) => Math.round(v) // Ensure whole numbers
//   },
//   propertyType: {
//     type: String,
//     enum: {
//       values: ['apartment', 'house', 'villa', 'pg', 'hostel'],
//       message: '{VALUE} is not a valid property type'
//     },
//     required: [true, 'Property type is required']
//   },
//   address: { 
//     type: addressSchema,
//     required: [true, 'Address is required'] 
//   },
//   images: { 
//     type: [String], 
//     required: [true, 'Images are required'],
//     validate: {
//       validator: (v: string[]) => v.length >= 3 && v.length <= 20,
//       message: 'Must provide between 3-20 images'
//     }
//   },
//   host: { 
//     type: Schema.Types.ObjectId, 
//     ref: "User",
//     required: [true, 'Host reference is required'],
//     immutable: true // Cannot be changed after creation
//   },
//   amenities: {
//     type: [String],
//     enum: ['wifi', 'ac', 'kitchen', 'laundry', 'parking', 'tv', 'geyser', 'furnished', 'security'],
//     default: []
//   },
//   maxGuests: { 
//     type: Number, 
//     required: [true, 'Maximum guests is required'],
//     min: [1, 'Must allow at least 1 guest'],
//     max: [50, 'Cannot exceed 50 guests']
//   },
//   bedrooms: { 
//     type: Number, 
//     required: [true, 'Bedrooms count is required'],
//     min: [1, 'Must have at least 1 bedroom'],
//     max: [20, 'Cannot exceed 20 bedrooms']
//   },
//   bathrooms: { 
//     type: Number, 
//     required: [true, 'Bathrooms count is required'],
//     min: [1, 'Must have at least 1 bathroom'],
//     max: [20, 'Cannot exceed 20 bathrooms']
//   },
//   availability: {
//     type: {
//       startDate: { 
//         type: Date, 
//         required: [true, 'Start date is required'],
//         validate: {
//           validator: function(this: any, v: Date) {
//             return !this.endDate || v <= this.endDate;
//           },
//           message: 'Start date must be before end date'
//         }
//       },
//       endDate: { 
//         type: Date,
//         validate: {
//           validator: function(this: any, v: Date) {
//             return !this.startDate || v >= this.startDate;
//           },
//           message: 'End date must be after start date'
//         }
//       }
//     },
//     required: [true, 'Availability is required']
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   rating: {
//     type: Number,
//     min: [1, 'Rating must be at least 1'],
//     max: [5, 'Rating cannot exceed 5'],
//     default: null
//   }
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true } 
// });

// // Add 2dsphere index for geospatial queries
// propertySchema.index({ 'address.coordinates': '2dsphere' });

// // Virtual for formatted address
// propertySchema.virtual('formattedAddress').get(function() {
//   return [
//     this.address.houseNumber,
//     this.address.street,
//     this.address.areaOrLocality,
//     this.address.city,
//     this.address.state,
//     this.address.pinCode,
//     this.address.country
//   ].filter(Boolean).join(', ');
// });

// // Pre-save hook for validation
// propertySchema.pre('save', function(next) {
//   if (this.isModified('availability')) {
//     if (this.availability.startDate > this.availability.endDate) {
//       throw new Error('End date must be after start date');
//     }
//   }
//   next();
// });

// export default mongoose.models.Property || mongoose.model("Property", propertySchema);






// import mongoose, { Schema } from "mongoose";

// // Address Sub-Schema
// const addressSchema = new mongoose.Schema({
//   houseNumber: { type: String, trim: true },
//   buildingName: { type: String, trim: true },
//   street: { type: String, required: [true, 'Street is required'], trim: true },
//   landmark: { type: String, trim: true },
//   areaOrLocality: { type: String, required: [true, 'Locality is required'], trim: true },
//   city: { type: String, required: [true, 'City is required'], trim: true },
//   state: { type: String, required: [true, 'State is required'], trim: true },
//   pinCode: { 
//     type: String, 
//     required: [true, 'PIN code is required'],
//     validate: {
//       validator: (v: string) => /^\d{6}$/.test(v),
//       message: 'PIN code must be 6 digits'
//     },
//     trim: true
//   },
//   country: { 
//     type: String, 
//     default: "India",
//     trim: true 
//   },
//   coordinates: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number],
//       required: false // Made optional
//     }
//   }
// }, { _id: false });

// // Main Property Schema
// const propertySchema = new mongoose.Schema({
//   title: { 
//     type: String, 
//     required: [true, 'Title is required'], 
//     minlength: [10, 'Title must be at least 10 characters'],
//     maxlength: [100, 'Title cannot exceed 100 characters'],
//     trim: true
//   },
//   description: { 
//     type: String, 
//     required: [true, 'Description is required'], 
//     minlength: [50, 'Description must be at least 50 characters'],
//     maxlength: [2000, 'Description cannot exceed 2000 characters'],
//     trim: true
//   },
//   price: { 
//     type: Number, 
//     required: [true, 'Price is required'],
//     min: [500, 'Minimum price is ₹500'],
//     max: [100000, 'Maximum price is ₹100,000'],
//     set: (v: number) => Math.round(v)
//   },
//   propertyType: {
//     type: String,
//     enum: ['apartment', 'house', 'villa', 'pg', 'hostel'],
//     required: [true, 'Property type is required']
//   },
//   address: { 
//     type: addressSchema,
//     required: [true, 'Address is required'] 
//   },
//   images: { 
//     type: [String],
//     default: []
//   },
//   host: { 
//     type: Schema.Types.ObjectId, 
//     ref: "User",
//     required: [true, 'Host reference is required'],
//     immutable: true
//   },
//   amenities: {
//     type: [String],
//     enum: ['wifi', 'ac', 'kitchen', 'laundry', 'parking', 'tv', 'geyser', 'furnished', 'security'],
//     default: []
//   },
//   maxGuests: { 
//     type: Number, 
//     required: [true, 'Maximum guests is required'],
//     min: [1, 'Must allow at least 1 guest'],
//     max: [50, 'Cannot exceed 50 guests']
//   },
//   bedrooms: { 
//     type: Number, 
//     required: [true, 'Bedrooms count is required'],
//     min: [1, 'Must have at least 1 bedroom'],
//     max: [20, 'Cannot exceed 20 bedrooms']
//   },
//   bathrooms: { 
//     type: Number, 
//     required: [true, 'Bathrooms count is required'],
//     min: [1, 'Must have at least 1 bathroom'],
//     max: [20, 'Cannot exceed 20 bathrooms']
//   },
//   availability: {
//     type: {
//       startDate: Date,
//       endDate: Date
//     },
//     required: false // Made optional
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, { 
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true } 
// });

// // Indexes
// propertySchema.index({ 'address.coordinates': '2dsphere' });

// export default mongoose.models.Property || mongoose.model("Property", propertySchema);



import mongoose, { Schema } from "mongoose";

const addressSchema = new mongoose.Schema({
  houseNumber: { type: String, trim: true, default: "" },
  buildingName: { type: String, trim: true, default: "" },
  street: { type: String, required: [true, 'Street is required'], trim: true },
  landmark: { type: String, trim: true, default: "" },
  areaOrLocality: { type: String, trim: true, default: "" },
  city: { type: String, required: [true, 'City is required'], trim: true },
  state: { type: String, required: [true, 'State is required'], trim: true },
  pinCode: { 
    type: String, 
    required: [true, 'PIN code is required'],
    validate: {
      validator: (v: string) => /^\d{6}$/.test(v),
      message: 'PIN code must be 6 digits'
    },
    trim: true
  },
  country: { type: String, default: "India", trim: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, { _id: false });

const propertySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'], 
    minlength: [50, 'Description must be at least 50 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [500, 'Minimum price is ₹500'],
    max: [100000, 'Maximum price is ₹100,000']
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'pg', 'hostel'],
    required: [true, 'Property type is required']
  },
  address: { 
    type: addressSchema,
    required: [true, 'Address is required'] 
  },
  media: { 
    type: [String],
    default: []
  },
  host: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: [true, 'Host reference is required'],
    immutable: true
  },
  amenities: {
    type: [String],
    enum: ['wifi', 'ac', 'kitchen', 'parking', 'tv'],
    default: []
  },
  maxGuests: { 
    type: Number, 
    required: [true, 'Maximum guests is required'],
    min: [1, 'Must allow at least 1 guest']
  },
  bedrooms: { 
    type: Number, 
    required: [true, 'Bedrooms count is required'],
    min: [1, 'Must have at least 1 bedroom']
  },
  bathrooms: { 
    type: Number, 
    required: [true, 'Bathrooms count is required'],
    min: [1, 'Must have at least 1 bathroom']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

export default mongoose.models.Property || mongoose.model("Property", propertySchema);
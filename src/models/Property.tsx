import mongoose, { Schema, Model } from "mongoose";
import { IProperty } from '../types/property';

const addressSchema = new Schema({
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
});

const propertySchema = new Schema<IProperty>({
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
  },
  availability: {
    startDate: { type: Date },
    endDate: { type: Date }
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      ret.host = ret.host.toString();
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      ret.host = ret.host.toString();
      delete ret.__v;
      return ret;
    }
  } 
});

// Create the model type
type PropertyModel = Model<IProperty>;

// Check if model exists before creating it
const Property: PropertyModel = mongoose.models.Property as PropertyModel || 
  mongoose.model<IProperty, PropertyModel>("Property", propertySchema);

export default Property;
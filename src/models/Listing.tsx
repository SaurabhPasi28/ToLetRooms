import { Schema, model, models } from 'mongoose';

const ListingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: { 
    city: { type: String, required: true },
    landmark: String,
  },
  type: { type: String, enum: ["PG", "Hostel", "Shared Room", "Private Room"], required: true },
  amenities: [String],
  images: [String],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  contactNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Prevent model overwrite in Next.js
export default models.Listing || model("Listing", ListingSchema);
import { Schema, model, Document, models } from 'mongoose';

interface IWishlist extends Document {
  userId: Schema.Types.ObjectId;
  propertyId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index to ensure a user can only add a property once to their wishlist
wishlistSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

const Wishlist = models.Wishlist || model<IWishlist>('Wishlist', wishlistSchema);
export type { IWishlist };
export default Wishlist; 
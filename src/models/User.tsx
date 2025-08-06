import { Schema, model, Document, models } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  googleId?: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: function() { return !this.googleId; },
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    // Remove unique: true from here if you're defining it separately
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; },
    select: false,
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: { 
    type: String,
    required: function() { return !this.googleId; },
    validate: {
      validator: function(v: string) {
        return !v || /^[6-9]\d{9}$/.test(v);
      },
      message: 'Invalid Indian phone number (must be 10 digits starting with 6-9)'
    }
  },
  googleId: { 
    type: String,
    // Remove unique: true from here if you're defining it separately
    sparse: true 
  },
  role: { 
    type: String, 
    enum: ['tenant', 'host'], 
    default: 'tenant' 
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Define indexes in one place only
// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
// userSchema.index({ phone: 1 });

// Rest of your schema (pre-save hooks, methods)

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: unknown) {
    if (err instanceof Error) {
      next(err); // Pass the actual Error object
    } else {
      next(new Error('An unknown error occurred during password hashing'));
    }
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, {unique: true , sparse: true });
userSchema.index({ phone: 1 });

// const User = model<IUser>('User', userSchema);
// export default User;


const User = models.User || model<IUser>('User', userSchema);
export type {IUser};
export default User;
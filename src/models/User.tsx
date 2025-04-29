import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: { 
    type: String, 
    required: function() { return !this.googleId; }
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: function() { return !this.googleId; },
    select: false
  },
  phone: { 
    type: String, 
    required: function() { return !this.googleId; },
    validate: {
      validator: function(v: string) {
        return !v || /^[6-9]\d{9}$/.test(v);
      },
      message: 'Invalid Indian phone number'
    }
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  role: { 
    type: String, 
    enum: ['tenant', 'host'], 
    default: 'tenant' 
  }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default model('User', userSchema);
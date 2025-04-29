// src/lib/dbConnect.ts (for Mongoose)
import mongoose from 'mongoose';

declare global {
  var mongoose: { conn: typeof mongoose | null, promise: Promise<typeof mongoose> | null };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined');

let cached = global.mongoose || { conn: null, promise: null };

export const dbConnect = async () => {
  if (cached.conn) return cached.conn;

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI);
  cached.conn = await cached.promise;
  
  return cached.conn;
};
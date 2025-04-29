import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from './mongodb-client';
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { sanitizePhone } from "@/utils/validation";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", optional: true },
        phone: { label: "Phone", type: "tel", optional: true }
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email) {
          throw new Error('Email is required');
        }

        const email = credentials.email.toLowerCase();
        const existingUser = await User.findOne({ email });

        // Login flow
        if (existingUser) {
          if (!credentials.password) {
            throw new Error('Password is required');
          }
          if (!existingUser.password) {
            throw new Error('Please sign in with Google');
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );
          if (!isValid) throw new Error('Invalid credentials');
          return existingUser;
        }

        // Registration flow
        if (!credentials.password || credentials.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (!credentials.name?.trim()) {
          throw new Error('Full name is required');
        }

        const cleanPhone = sanitizePhone(credentials.phone || '');
        if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
          throw new Error('Valid 10-digit Indian phone number required');
        }

        const phoneExists = await User.findOne({ phone: cleanPhone });
        if (phoneExists) {
          throw new Error('Phone number already registered');
        }

        return await User.create({
          name: credentials.name.trim(),
          email,
          phone: cleanPhone,
          password: await bcrypt.hash(credentials.password, 12),
          role: "tenant"
        });
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          role: 'tenant',
          googleId: profile.sub
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.googleId = user.googleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.googleId = token.googleId as string | undefined;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            googleId: user.id,
            role: 'tenant'
          });
        }
      }
      return true;
    }
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};
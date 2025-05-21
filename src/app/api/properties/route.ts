// // app/api/properties/route.ts
// import { getServerSession } from 'next-auth';
// import { NextResponse } from 'next/server';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';
// import { z } from 'zod';

// // Define validation schema
// const propertySchema = z.object({
//   title: z.string().min(10).max(100),
//   description: z.string().min(50).max(2000),
//   price: z.number().min(500).max(100000),
//   propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'hostel']),
//   address: z.object({
//     street: z.string().min(2),
//     city: z.string().min(2),
//     state: z.string().min(2),
//     pinCode: z.string().length(6),
//   }),
//   // images: z.array(z.string().url()).min(3).max(10),
//   amenities: z.array(z.string()).optional(),
//   maxGuests: z.number().min(1).max(50),
//   bedrooms: z.number().min(1).max(20),
//   bathrooms: z.number().min(1).max(20),
// });

// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json(
//         { error: 'Unauthorized - Please log in' },
//         { status: 401 }
//       );
//     }

//     // Verify user role if needed
//     // if (session.user.role !== 'host') {
//     //   return NextResponse.json(
//     //     { error: 'Only hosts can create properties' },
//     //     { status: 403 }
//     //   );
//     // }

//     const rawData = await req.json();

//     const completeData = {
//       ...rawData,
//       images: rawData.images || [], // Default empty array
//       isActive: true
//     };
    
//     // Validate input data
//     const validation = propertySchema.safeParse(rawData);
//     if (!validation.success) {
//       return NextResponse.json(
//         { 
//           error: 'Validation failed',
//           details: validation.error.errors 
//         },
//         { status: 400}
//       );
//     }

//     const propertyData = validation.data;

//     // Check for duplicate properties
//     console.log("working till here------------>1");
//     const existingProperty = await Property.findOne({ 
//       title: propertyData.title,
//       'address.street': propertyData.address.street
//     });
//      console.log("working till here------------>2");
//     if (existingProperty) {
//       return NextResponse.json(
//         { error: 'Property with this title and address already exists' },
//         { status: 409 }
//       );
//     }
//      console.log("working till here------------>3",session.user);
//      console.log(propertyData)
//     // Create property
//     const property = await Property.create({
//       ...propertyData,
//       host: session.user.id,
//       isActive: true, // Default active status
//       createdAt: new Date(),
//     });
//      console.log("working till here------------>4");
//     return NextResponse.json(property, { status: 201 });

//   } catch (error) {
//     console.error('Property creation error:', error);
    
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Validation failed', details: error.errors },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         message: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// // Add GET endpoint for fetching properties
// export async function GET(req: Request) {
//   try {
//     await dbConnect();
    
//     const { searchParams } = new URL(req.url);
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const page = parseInt(searchParams.get('page') || '1');

//     const properties = await Property.find({ isActive: true })
//       .limit(limit)
//       .skip((page - 1) * limit)
//       .populate('host', 'name email') // Only return necessary host info
//       .lean();

//     const total = await Property.countDocuments({ isActive: true });

//     return NextResponse.json({
//       data: properties,
//       pagination: {
//         total,
//         page,
//         pages: Math.ceil(total / limit),
//         limit
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching properties:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch properties' },
//       { status: 500 }
//     );
//   }
// }


// import { getServerSession } from 'next-auth';
// import { NextResponse } from 'next/server';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';
// import mongoose from 'mongoose';

// export async function POST(req: Request) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const rawData = await req.json();
    
//     // Transform data to match schema
//     const propertyData = {
//       ...rawData,
//       images: rawData.images || [], // Ensure array exists
//       address: {
//         ...rawData.address,
//         areaOrLocality: rawData.address.areaOrLocality || '', // Default empty
//         coordinates: rawData.address.coordinates || undefined // Skip if not provided
//       }
//     };

//     const property = await Property.create({
//       ...propertyData,
//       host: session.user.id
//     });

//     return NextResponse.json(property, { status: 201 });

//   } catch (error: any) {
//     console.error('Property creation error:', error);
    
//     // Simplified error handling
//     return NextResponse.json(
//       { 
//         error: 'Validation failed',
//         details: error.errors ? Object.values(error.errors).map((err: any) => err.message) 
//                : [error.message]
//       },
//       { status: 400 }
//     );
//   }
// }

// export async function GET(req: Request) {
//   try {
//     await dbConnect();
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const properties = await Property.find({ 
//       host: new mongoose.Types.ObjectId(session.user.id) 
//     }).sort({ createdAt: -1 });

//     return NextResponse.json(properties);

//   } catch (error: any) {
//     console.error('Error fetching properties:', error);
//     return NextResponse.json(
//       { error: error.message || 'Server error' },
//       { status: 500 }
//     );
//   }
// }



import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawData = await req.json();

    const propertyData = {
      ...rawData,
      host: new mongoose.Types.ObjectId(session.user.id),
      images: rawData.images || []
    };

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const property = await Property.create(propertyData);
    return NextResponse.json(property, { status: 201 });

  } catch (error:unknown) {
    console.error('Property creation error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Server error',
        // details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : []
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await Property.find({ host: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(properties);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
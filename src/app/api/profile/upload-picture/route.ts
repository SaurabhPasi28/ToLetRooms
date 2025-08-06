// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { dbConnect } from '@/lib/dbConnect';
// import User from '@/models/User';

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     await dbConnect();
//     const user = await User.findById(session.user.id).select('-password');
    
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json({ user });
//   } catch (error) {
//     console.error('Profile GET error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     await dbConnect();

//     const updateData: any = {};
    
//     // Handle profile picture updates
//     if (body.profilePicture !== undefined) {
//       updateData.profilePicture = body.profilePicture;
//     }
    
//     // Handle other profile fields
//     if (body.name) updateData.name = body.name;
//     if (body.phone !== undefined) updateData.phone = body.phone;
//     if (body.bio !== undefined) updateData.bio = body.bio;
//     if (body.dateOfBirth) updateData.dateOfBirth = body.dateOfBirth;
//     if (body.address) updateData.address = body.address;

//     const user = await User.findByIdAndUpdate(
//       session.user.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     return NextResponse.json({ user });
//   } catch (error) {
//     console.error('Profile PUT error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
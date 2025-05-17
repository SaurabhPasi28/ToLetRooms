// // app/api/properties/route.ts
// import { getServerSession } from 'next-auth';
// import { NextResponse } from 'next/server';
// import { authOptions } from '@/lib/auth';
// import Property from '@/models/Property';
// import { dbConnect } from '@/lib/dbConnect';

// export async function POST(req: Request) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const data = await req.json();
//     const property = await Property.create({
//       ...data,
//       host: session.user.id
//     });

//     return NextResponse.json(property);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to create property' },
//       { status: 400 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import Property from '@/models/Property';
import { deleteFromCloudinary, deleteManyFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

// GET - Get property details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const property = await Property.findOne({
      _id: id,
      host: session.user.id
    }).lean();

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Serialize the property data
    const propertyData = {
      _id: property._id.toString(),
      title: property.title,
      description: property.description,
      price: property.price,
      propertyType: property.propertyType,
      address: property.address,
      media: property.media || [],
      amenities: property.amenities || [],
      maxGuests: property.maxGuests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      isActive: property.isActive,
      host: property.host.toString(),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };

    return NextResponse.json(propertyData);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find the property first to get media URLs
    const property = await Property.findOne({
      _id: id,
      host: session.user.id
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Extract public IDs from media URLs for Cloudinary deletion
    const publicIds: string[] = [];
    if (property.media && Array.isArray(property.media)) {
      for (const mediaUrl of property.media) {
        const publicId = extractPublicIdFromUrl(mediaUrl);
        if (publicId) {
          publicIds.push(publicId);
        }
      }
    }

    // Delete files from Cloudinary
    if (publicIds.length > 0) {
      try {
        await deleteManyFromCloudinary(publicIds, 'image');
        console.log(`Deleted ${publicIds.length} files from Cloudinary:`, publicIds);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete the property from database
    const deletedProperty = await Property.findByIdAndDelete(id);

    if (!deletedProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Property deleted successfully',
      deletedFiles: publicIds.length
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Check if property exists and belongs to user
    const existingProperty = await Property.findOne({
      _id: id,
      host: session.user.id
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedProperty) {
      return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
    }

    // Serialize the response
    const propertyData = {
      _id: updatedProperty._id.toString(),
      title: updatedProperty.title,
      description: updatedProperty.description,
      price: updatedProperty.price,
      propertyType: updatedProperty.propertyType,
      address: updatedProperty.address,
      media: updatedProperty.media || [],
      amenities: updatedProperty.amenities || [],
      maxGuests: updatedProperty.maxGuests,
      bedrooms: updatedProperty.bedrooms,
      bathrooms: updatedProperty.bathrooms,
      isActive: updatedProperty.isActive,
      host: updatedProperty.host.toString(),
      createdAt: updatedProperty.createdAt,
      updatedAt: updatedProperty.updatedAt
    };

    return NextResponse.json({
      message: 'Property updated successfully',
      property: propertyData
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
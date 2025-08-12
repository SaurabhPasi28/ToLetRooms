import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/dbConnect';
import Property from '@/models/Property';
import { deleteManyFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

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

    // Separate images and videos for proper deletion
    const imagePublicIds: string[] = [];
    const videoPublicIds: string[] = [];
    
    if (property.media && Array.isArray(property.media)) {
      for (const mediaUrl of property.media) {
        const publicId = extractPublicIdFromUrl(mediaUrl);
        if (publicId) {
          // Determine if it's a video based on file extension
          const isVideo = mediaUrl.match(/\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i);
          if (isVideo) {
            videoPublicIds.push(publicId);
          } else {
            imagePublicIds.push(publicId);
          }
        }
      }
    }

    console.log('Deleting media files:', {
      images: imagePublicIds.length,
      videos: videoPublicIds.length,
      imageIds: imagePublicIds,
      videoIds: videoPublicIds
    });

    // Delete images from Cloudinary
    if (imagePublicIds.length > 0) {
      try {
        await deleteManyFromCloudinary(imagePublicIds, 'image');
        console.log(`Deleted ${imagePublicIds.length} images from Cloudinary`);
      } catch (cloudinaryError) {
        console.error('Error deleting images from Cloudinary:', cloudinaryError);
      }
    }

    // Delete videos from Cloudinary
    if (videoPublicIds.length > 0) {
      try {
        await deleteManyFromCloudinary(videoPublicIds, 'video');
        console.log(`Deleted ${videoPublicIds.length} videos from Cloudinary`);
      } catch (cloudinaryError) {
        console.error('Error deleting videos from Cloudinary:', cloudinaryError);
      }
    }

    // Delete the property from database
    const deletedProperty = await Property.findByIdAndDelete(id);

    if (!deletedProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Property deleted successfully',
      deletedImages: imagePublicIds.length,
      deletedVideos: videoPublicIds.length
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
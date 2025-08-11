import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const publicId = formData.get('publicId') as string;

    console.log('Upload request received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      folder,
      publicId
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ 
        error: 'Only image and video files are allowed',
        details: `File type "${file.type}" is not supported`
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size must be less than 10MB',
        details: `File size ${file.size} bytes exceeds limit`
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('File converted to buffer:', {
      bufferSize: buffer.length,
      fileType: file.type
    });

    // Generate unique public ID if not provided
    const finalPublicId = publicId || `${folder}-${session.user.id}-${Date.now()}`;

    console.log('Uploading to Cloudinary with public ID:', finalPublicId);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, folder, finalPublicId);

    if (!result?.secure_url) {
      console.error('Cloudinary upload failed - no secure_url returned');
      return NextResponse.json({ error: 'Failed to upload file to Cloudinary' }, { status: 500 });
    }

    console.log('Upload successful:', {
      publicId: result.public_id,
      url: result.secure_url,
      type: result.resource_type,
      format: result.format
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
      format: result.format,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { publicId, url, resourceType = 'image' } = await request.json();
    
    console.log('Delete request:', { publicId, url, resourceType });
    
    if (!publicId && !url) {
      return NextResponse.json({ error: 'Public ID or URL is required' }, { status: 400 });
    }

    let finalPublicId = publicId;
    if (!finalPublicId && url) {
      finalPublicId = extractPublicIdFromUrl(url);
    }
    
    if (!finalPublicId) {
      return NextResponse.json({ error: 'Could not extract public ID' }, { status: 400 });
    }

    const result = await deleteFromCloudinary(finalPublicId, resourceType);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    }
    
    return NextResponse.json({ error: 'Deletion failed' }, { status: 400 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

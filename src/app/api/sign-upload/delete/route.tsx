import { NextResponse } from 'next/server';
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const { publicId, url, resourceType = 'image' } = await req.json();
    
    console.log('Delete request received:', { publicId, url, resourceType });
    
    // If we have a publicId, use it directly
    if (publicId) {
      console.log('Using provided public ID:', publicId);
      const result = await deleteFromCloudinary(publicId, resourceType);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'File deleted successfully',
          publicId: publicId
        });
      } else {
        return NextResponse.json({ 
          error: 'Deletion failed',
          details: result.result
        }, { status: 400 });
      }
    }
    
    // If we have a URL but no publicId, try to extract it
    if (url) {
      const extractedPublicId = extractPublicIdFromUrl(url);
      console.log('Extracted public ID from URL:', extractedPublicId);
      
      if (!extractedPublicId) {
        return NextResponse.json({ 
          error: 'Could not extract public ID from URL',
          url: url
        }, { status: 400 });
      }
      
      const result = await deleteFromCloudinary(extractedPublicId, resourceType);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'File deleted successfully',
          publicId: extractedPublicId
        });
      } else {
        return NextResponse.json({ 
          error: 'Deletion failed',
          details: result.result
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Public ID or URL is required'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
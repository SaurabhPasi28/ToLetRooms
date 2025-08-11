import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Detect file type from buffer
 */
function detectFileType(buffer: Buffer): string {
  // Check for common file signatures
  const signatures = {
    '/9j/': 'image/jpeg',
    'iVBORw0KGgo': 'image/png',
    'R0lGODlh': 'image/gif',
    'UklGRg==': 'image/webp',
    'AAABAAE': 'image/ico',
    // Video signatures - check for MP4/MOV file signatures
    'ftypmp4': 'video/mp4',
    'ftypiso': 'video/mp4',
    'ftypM4V': 'video/mp4',
    'ftypqt': 'video/mov',
    'ftyp3gp': 'video/3gp',
    'ftypMSNV': 'video/mp4',
    'ftypisom': 'video/mp4',
  };

  const base64 = buffer.toString('base64');
  
  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (base64.startsWith(signature)) {
      console.log('Detected file type:', mimeType, 'for signature:', signature);
      return mimeType;
    }
  }
  
  // If we can't detect the type, try to infer from the first few bytes
  const firstBytes = buffer.slice(0, 12);
  const hexString = firstBytes.toString('hex');
  
  console.log('Could not detect file type from signatures. First bytes:', hexString);
  
  // Default to image/jpeg if we can't detect
  return 'image/jpeg';
}

/**
 * Generate a signed upload signature for Cloudinary
 */
export async function generateUploadSignature(uploadPreset?: string, folder?: string) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params: any = {
      timestamp,
    };

    if (uploadPreset) {
      params.upload_preset = uploadPreset;
    } else if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      params.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    if (folder) {
      params.folder = folder;
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: params.upload_preset,
      folder: folder,
    };
  } catch (error) {
    console.error('Error generating upload signature:', error);
    throw new Error('Failed to generate upload signature');
  }
}

/**
 * Upload a file directly to Cloudinary (server-side)
 */
export async function uploadToCloudinary(
  file: Buffer | string, 
  folder?: string, 
  publicId?: string
) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables:', {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
      });
      throw new Error('Missing Cloudinary environment variables');
    }

    const uploadOptions: any = {
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      overwrite: true,
      invalidate: true,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Convert buffer to base64 if needed
    let fileData: string;
    if (Buffer.isBuffer(file)) {
      const fileType = detectFileType(file);
      console.log('Detected file type for upload:', fileType);
      fileData = `data:${fileType};base64,${file.toString('base64')}`;
    } else {
      fileData = file;
    }

    console.log('Uploading to Cloudinary with options:', {
      folder: uploadOptions.folder,
      public_id: uploadOptions.public_id,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    });

    const result = await cloudinary.uploader.upload(fileData, uploadOptions);
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image') {
  try {
    console.log('Deleting from Cloudinary:', { publicId, resourceType });
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Missing Cloudinary environment variables');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    console.log('Cloudinary delete response:', result);
    
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Failed to delete file from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    console.log('Extracting public ID from URL:', url);
    
    // Remove protocol and domain
    let cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
    
    // Remove version number if present
    cleanUrl = cleanUrl.replace(/\/v\d+\//, '/');
    
    // Extract the path after /upload/
    const uploadMatch = cleanUrl.match(/\/upload\/(.+?)(?:\.[^.]*)?$/);
    if (uploadMatch) {
      const publicId = uploadMatch[1];
      console.log('Extracted public ID:', publicId);
      return publicId;
    }
    
    // Fallback: try to extract from the end of the URL
    const endMatch = cleanUrl.match(/\/([^\/]+?)(?:\.[^.]*)?$/);
    if (endMatch) {
      const publicId = endMatch[1];
      console.log('Extracted public ID (fallback):', publicId);
      return publicId;
    }
    
    console.log('Could not extract public ID from URL');
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * Delete multiple files from Cloudinary with automatic resource type detection
 * @param publicIds - Array of public IDs to delete
 * @param resourceType - Type of resource ('image', 'video', 'raw', 'auto')
 * @returns Deletion result
 */
export async function deleteManyFromCloudinary(publicIds: string[], resourceType: string = 'image') {
  try {
    if (publicIds.length === 0) {
      return {
        success: true,
        deleted: {},
        not_found: {}
      };
    }

    // If resourceType is 'auto', we need to detect and delete separately
    if (resourceType === 'auto') {
      const imageIds: string[] = [];
      const videoIds: string[] = [];
      
      // For now, we'll try to delete all as images first, then as videos
      // This is a fallback approach since we don't have the original URLs
      
      const imageResult = await cloudinary.api.delete_resources(imageIds.length > 0 ? imageIds : publicIds, {
        resource_type: 'image'
      });
      
      const videoResult = await cloudinary.api.delete_resources(videoIds.length > 0 ? videoIds : publicIds, {
        resource_type: 'video'
      });
      
      console.log('Cloudinary mixed delete result:', { imageResult, videoResult });
      
      return {
        success: Object.keys(imageResult.deleted).length > 0 || Object.keys(videoResult.deleted).length > 0,
        deleted: { ...imageResult.deleted, ...videoResult.deleted },
        not_found: { ...imageResult.not_found, ...videoResult.not_found },
      };
    } else {
      // Use the specified resource type
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType
      });
      
      console.log('Cloudinary bulk delete result:', result);
      
      return {
        success: Object.keys(result.deleted).length > 0,
        deleted: result.deleted,
        not_found: result.not_found,
      };
    }
  } catch (error) {
    console.error('Error deleting multiple files from Cloudinary:', error);
    throw new Error('Failed to delete files from Cloudinary');
  }
}

export default cloudinary;
'use client';
import { useState, useEffect} from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

type MediaFile = {
  url: string;
  type: 'image' | 'video';
  publicId: string;
};

export default function MediaUploader({ 
  value = [], 
  onChange 
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to extract public ID from URL
  const extractPublicIdFromUrl = (url: string): string | null => {
    try {
      // Remove protocol and domain
      let cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
      
      // Remove version number if present
      cleanUrl = cleanUrl.replace(/\/v\d+\//, '/');
      
      // Extract the path after /upload/
      const uploadMatch = cleanUrl.match(/\/upload\/(.+?)(?:\.[^.]*)?$/);
      if (uploadMatch) {
        const publicId = uploadMatch[1];
        return publicId;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  };

  // Initialize with existing images


  // useEffect(() => {
  //   if (!isInitialized && Array.isArray(value)) {
  //     const initialFiles = value.map(url => ({
  //       url,
  //       type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image',
  //       publicId: extractPublicIdFromUrl(url) || ''
  //     }));
  //     setFiles(initialFiles);
  //     setIsInitialized(true);
  //   }
  // }, [value, isInitialized]);

  const getFileType = (url: string): MediaFile['type'] =>
  /\.(mp4|mov|avi|webm)$/i.test(url) ? 'video' : 'image';

  useEffect(() => {
  if (!isInitialized && Array.isArray(value)) {
    const initialFiles = value.map(url => ({
      url,
      type: getFileType(url),
      publicId: extractPublicIdFromUrl(url) || ''
    }));
    setFiles(initialFiles);
    setIsInitialized(true);
  }
}, [value, isInitialized]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(e.target.files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'properties');

        console.log('Uploading file:', {
          name: file.name,
          type: file.type,
          size: file.size,
          isVideo: file.type.startsWith('video/'),
          isImage: file.type.startsWith('image/')
        });

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        const responseData = await response.json();
        console.log('Upload response:', responseData);

        if (!response.ok) {
          const errorMessage = responseData.error || responseData.details || `Upload failed: ${response.status}`;
          console.error('Upload failed:', errorMessage);
          throw new Error(errorMessage);
        }
        
        return responseData;
      });

      // const results = await Promise.all(uploadPromises);
      // const newFiles = results.map(result => ({
      //   url: result.url,
      //   type: result.type === 'video' ? 'video' : 'image',
      //   publicId: result.publicId
      // }));

      // const updatedFiles = [...files, ...newFiles];
      // setFiles(updatedFiles);
      // onChange(updatedFiles.map(f => f.url));
      const results = await Promise.all(uploadPromises);

const newFiles: MediaFile[] = results.map(result => ({
  url: result.url,
  type: result.type === 'video' ? 'video' as const : 'image' as const,
  publicId: result.publicId
}));

const updatedFiles = [...files, ...newFiles];
setFiles(updatedFiles);
onChange(updatedFiles.map(f => f.url));

      
      toast.success(`Successfully uploaded ${results.length} file(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (publicId: string, url: string, fileType: 'image' | 'video', e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Determine resource type based on file type
      const resourceType = fileType === 'video' ? 'video' : 'image';
      
      console.log('Deleting file:', { publicId, url, resourceType });
      
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publicId, 
          url,
          resourceType
        })
      });
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (!response.ok) {
        const errorMessage = result.error || result.details || 'Failed to delete file';
        throw new Error(errorMessage);
      }
      
      // Update local state
      const updatedFiles = files.filter(f => f.publicId !== publicId);
      setFiles(updatedFiles);
      onChange(updatedFiles.map(f => f.url));
      
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            {isUploading ? 'Uploading...' : 'Click to upload images and videos'}
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, MP4, MOV up to 10MB</p>
        </div>
        <input
          type="file"
          className="hidden"
          onChange={handleUpload}
          multiple
          accept="image/*,video/*"
          disabled={isUploading}
        />
      </label>

      {Array.isArray(files) && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.publicId} className="relative group">
              {file.type === 'image' ? (
                <Image
                  src={file.url}
                  alt="Uploaded content"
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <video
                  controls
                  className="w-full h-48 object-cover rounded-lg"
                  src={file.url}
                />
              )}
              <button
                type="button"
                onClick={(e) => handleDelete(file.publicId, file.url, file.type, e)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Delete this file"
              >
                <Trash2 size={16} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                {file.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
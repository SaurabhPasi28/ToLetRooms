
'use client';
import { useState, useEffect, useRef } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

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
  const initialRender = useRef(true);

  // Initialize with existing images (only on first render)
  useEffect(() => {
    if (initialRender.current && value.length > 0) {
      setFiles(value.map(url => ({
        url,
        type: url.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image',
        publicId: url.split('/').pop()?.split('.')[0] || ''
      })));
      initialRender.current = false;
    }
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setIsUploading(true);
    try {
      const sigResponse = await fetch('/api/sign-upload');
      const { signature, timestamp, apiKey, cloudName, uploadPreset } = 
        await sigResponse.json();

      const uploads = Array.from(e.target.files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
      });

      const results = await Promise.all(uploads);
      const newFiles = results.map(result => ({
        url: result.secure_url,
        type: result.resource_type,
        publicId: result.public_id
      }));

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange(updatedFiles.map(f => f.url));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      // Delete from Cloudinary
      await fetch('/api/sign-upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
      });
      
      // Update local state
      const updatedFiles = files.filter(f => f.publicId !== publicId);
      setFiles(updatedFiles);
      onChange(updatedFiles.map(f => f.url));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-8 h-8 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            {isUploading ? 'Uploading...' : 'Click to upload'}
          </p>
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
              onClick={() => handleDelete(file.publicId)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete this file"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
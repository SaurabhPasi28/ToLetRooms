import Property from '@/models/Property';
import { dbConnect } from '@/lib/dbConnect';
import PropertyDetails from '@/components/property/PropertyDetails';
import { notFound } from 'next/navigation';

// Helper function to convert Mongoose document to plain object
function toPlainObject(doc: any) {
  if (!doc) return null;
  
  // Convert special types to plain JS types
  const obj = { ...doc };
  obj._id = obj._id.toString();
  
  // Handle nested objects
  if (obj.host) {
    obj.host = { ...obj.host };
    if (obj.host._id) {
      obj.host._id = obj.host._id.toString();
    }
    // Remove any Buffer/Uint8Array fields
    if (obj.host.buffer) {
      delete obj.host.buffer;
    }
  }

  // Convert images to media array
  if (obj.media) {
    obj.media = obj.media.map((url: string) => ({
      url,
      type: url.match(/\.(mp4|mov|avi|webm)$/i) ? 'video' : 'image'
    }));
    delete obj.images;
  }

  // Remove any other Buffer/Uint8Array fields
  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof Buffer || obj[key] instanceof Uint8Array) {
      delete obj[key];
    }
  });

  return obj;
}

// export default async function PropertyPage({
//   params,
// }: {
//   params: { id: string };
// }) {


export default async function PropertyPage({
  params,
}: any) {
  await dbConnect();

  const property = await Property.findById(params.id)
    .lean() // Convert to plain JavaScript object
    .then(toPlainObject);

  if (!property) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <PropertyDetails property={property} />
    </main>
  );
}
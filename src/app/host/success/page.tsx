// app/(host)/new/success/page.tsx
export default function SuccessPage() {
    return (
      <div className="text-center py-16">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold">Listing Created Successfully!</h2>
        <p className="mt-2">Your property is now visible to potential tenants.</p>
        <div className="mt-6">
          <Link href="/host/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
import { Suspense } from 'react'
import SearchBar from '@/components/SearchBar'
import CategoryList from '@/components/CategoryList'
import PropertyGrid from '@/components/PropertyGrid'
import PropertyGridSkeleton from '@/components/PropertyGridSkeleton'
import { getFeaturedProperties } from '@/lib/actions'
import MediaUploader from '@/components/property/MediaUploader'

export default async function Home() {
  return (
    <main className="px-4 md:px-8 lg:px-12">
      {/* Hero Section with Search */}
      <div className="relative h-[70vh] bg-[url('/airbnb-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-full max-w-5xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Find your perfect stay in India
            </h1>
            <SearchBar variant="hero" />
          </div>
        </div>
      </div>
        <MediaUploader/>
      {/* Categories & Properties */}
      <div className="max-w-7xl mx-auto py-8">
        <CategoryList />
        <Suspense fallback={<PropertyGridSkeleton />}>
          <FeaturedProperties />
        </Suspense>
      </div>
    </main>
  )
}

async function FeaturedProperties() {
  const properties = await getFeaturedProperties()
  return <PropertyGrid properties={properties} />
}
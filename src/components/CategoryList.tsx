'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const categories = [
  { id: 'arctic', name: 'Arctic', icon: '❄️' },
  { id: 'national-parks', name: 'National parks', icon: '🌲' },
  { id: 'amazing-pools', name: 'Amazing pools', icon: '🏊' },
  { id: 'cabins', name: 'Cabins', icon: '🏡' },
  { id: 'farms', name: 'Farms', icon: '🚜' },
  { id: 'beachfront', name: 'Beachfront', icon: '🏖️' },
  { id: 'trending', name: 'Trending', icon: '🔥' },
  { id: 'omg', name: 'OMG!', icon: '😲' },
  { id: 'guest-favorites', name: 'Guest favorites', icon: '⭐' }
]

export default function CategoryList() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // You can add filtering logic here
    // router.push(`/?category=${categoryId}`)
  }

  return (
    <div className="flex overflow-x-auto gap-8 py-6 scrollbar-hide">
      {categories.map((category) => (
        <div 
          key={category.id}
          className={`flex flex-col items-center min-w-fit cursor-pointer transition-all ${selectedCategory === category.id ? 'border-b-2 border-black' : 'opacity-70'}`}
          onClick={() => handleCategoryClick(category.id)}
        >
          <div className="text-2xl mb-2">{category.icon}</div>
          <div className="text-sm whitespace-nowrap">{category.name}</div>
        </div>
      ))}
    </div>
  )
}
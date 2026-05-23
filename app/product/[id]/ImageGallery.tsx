"use client"

import { useState } from "react"
import { Package, ChevronLeft, ChevronRight } from "lucide-react"

export default function ImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-3xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center text-gray-400 border border-gray-200 dark:border-zinc-800">
        <Package className="w-20 h-20 opacity-50" />
      </div>
    )
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 group shadow-lg">
        <img 
          src={images[currentIndex]} 
          alt={`Product Image ${currentIndex + 1}`} 
          className="w-full h-full object-contain"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black text-gray-900 dark:text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 px-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx 
                  ? "border-blue-500 shadow-md ring-2 ring-blue-500/20" 
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

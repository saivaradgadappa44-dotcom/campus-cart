"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Upload, X, Loader2, DollarSign, Tag, Image as ImageIcon } from "lucide-react"

export default function CreateListing() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [condition, setCondition] = useState("good")
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  
  // Image handling
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      
      // Limit to 4 images max
      if (images.length + selectedFiles.length > 4) {
        setError("You can only upload up to 4 images.")
        return
      }

      setImages((prev) => [...prev, ...selectedFiles])
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index])
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("You must be logged in to create a listing")

      if (!categoryId) throw new Error("Please select a category")
      if (images.length === 0) throw new Error("Please upload at least one image")

      // Upload Images
      const uploadedImageUrls = []
      for (const file of images) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${session.user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)
          
        uploadedImageUrls.push(publicUrl)
      }

      // Create Product Listing
      const { error: insertError, data: product } = await supabase.from('products').insert({
        seller_id: session.user.id,
        category_id: categoryId,
        title,
        description,
        price: parseFloat(price),
        condition,
        images: uploadedImageUrls,
        status: 'active'
      }).select().single()

      if (insertError) throw insertError

      router.push(`/product/${product.id}`)
      
    } catch (err: any) {
      setError(err.message || "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sell an Item</h1>
        <p className="text-gray-500 mt-2">List your product to students on campus.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-semibold border-b border-gray-100 dark:border-zinc-800 pb-4">Basic Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MacBook Pro M1 2020"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && <option value="fallback-id">Other</option>}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { id: 'new', label: 'New' },
                  { id: 'like_new', label: 'Like New' },
                  { id: 'good', label: 'Good' },
                  { id: 'fair', label: 'Fair' },
                  { id: 'poor', label: 'Poor' },
                ].map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setCondition(cond.id)}
                    className={`py-2 text-sm rounded-lg border transition-all ${
                      condition === cond.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                        : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item, including any flaws, reason for selling, and specifications..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-semibold">Images</h2>
            <span className="text-sm text-gray-500">{images.length}/4</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-zinc-800">
                <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length < 4 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-zinc-900/50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {images.length === 0 && (
             <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg text-sm border border-amber-200 dark:border-amber-900/30">
               <ImageIcon className="w-4 h-4" />
               <p>Please upload at least one image of your item.</p>
             </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Listing"}
          </button>
        </div>
      </form>
    </div>
  )
}

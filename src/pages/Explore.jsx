import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiSearch, HiAdjustments, HiViewGrid, HiViewList } from 'react-icons/hi'
import ObjectCard from '../components/ObjectCard'

const categories = [
  { id: 'all', label: 'All Assets' },
  { id: 'characters', label: 'Characters' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'nature', label: 'Nature' },
  { id: 'props', label: 'Props' },
  { id: 'abstract', label: 'Abstract' },
]

const sortOptions = [
  { id: 'newest', label: 'Newest First' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
]

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [objects, setObjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const activeCategory = searchParams.get('category') || 'all'
  const activeSort = searchParams.get('sort') || 'newest'

  useEffect(() => {
    fetchObjects()
  }, [activeCategory, activeSort, search])

  const fetchObjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.set('category', activeCategory)
      if (activeSort) params.set('sort', activeSort)
      if (search) params.set('search', search)

      const res = await fetch(`/api/objects?${params}`)
      const data = await res.json()
      setObjects(data)
    } catch (error) {
      console.error('Failed to fetch objects:', error)
    } finally {
      setLoading(false)
    }
  }

  const setCategory = (cat) => {
    if (cat === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams)
  }

  const setSort = (sort) => {
    searchParams.set('sort', sort)
    setSearchParams(searchParams)
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Explore <span className="gradient-text">3D Assets</span>
          </h1>
          <p className="text-mist text-lg">
            Discover unique 3D objects from talented creators worldwide
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mist" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate border border-white/10 rounded-xl text-white placeholder-mist focus:outline-none focus:border-glow/50 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-4">
            <select
              value={activeSort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3.5 bg-slate border border-white/10 rounded-xl text-white focus:outline-none focus:border-glow/50 transition-colors cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-slate">
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-slate rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-glow/20 text-glow' : 'text-mist hover:text-white'}`}
              >
                <HiViewGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-glow/20 text-glow' : 'text-mist hover:text-white'}`}
              >
                <HiViewList className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-3.5 bg-slate border border-white/10 rounded-xl text-mist hover:text-white transition-colors"
            >
              <HiAdjustments className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 shrink-0`}>
            <div className="glass rounded-2xl p-4 sticky top-24">
              <h3 className="font-semibold mb-4 px-2">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                      activeCategory === cat.id
                        ? 'bg-glow/20 text-glow font-medium'
                        : 'text-mist hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Objects Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-slate" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-slate rounded w-3/4" />
                      <div className="h-4 bg-slate rounded w-full" />
                      <div className="h-4 bg-slate rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : objects.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate flex items-center justify-center">
                  <HiSearch className="w-10 h-10 text-mist" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No assets found</h3>
                <p className="text-mist">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <p className="text-mist mb-6">{objects.length} assets found</p>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {objects.map((obj, i) => (
                    <ObjectCard key={obj._id} object={obj} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


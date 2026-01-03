import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiShoppingCart, HiDownload, HiShare, HiHeart, HiArrowLeft, HiExternalLink } from 'react-icons/hi'
import { FaEthereum } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import Model3DViewer from '../components/Model3DViewer'
import WalletModal from '../components/WalletModal'

export default function ObjectDetail() {
  const { id } = useParams()
  const { account, isConnected, openWalletModal, showWalletModal, closeWalletModal, connectWithWallet, error, loading: walletLoading, clearError } = useWallet()
  const [object, setObject] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    fetchObject()
  }, [id])

  const fetchObject = async () => {
    try {
      const res = await fetch(`/api/objects/${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setObject(data)
    } catch (error) {
      console.error('Failed to fetch object:', error)
    } finally {
      setPageLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isConnected) {
      openWalletModal()
      return
    }

    if (!window.ethereum) {
      alert('Please install MetaMask to make purchases')
      return
    }

    setPurchasing(true)
    
    try {
      // Simulate transaction (in production, this would be a real blockchain tx)
      const provider = new window.ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // For demo, we'll just simulate the purchase
      // In production: const tx = await signer.sendTransaction({ to: object.creatorAddress, value: ethers.parseEther(object.price) })
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate tx time

      // Record purchase
      await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectId: object.id,
          buyerAddress: account,
          txHash: `0x${Math.random().toString(16).slice(2)}` // Demo tx hash
        })
      })

      setPurchased(true)
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setPurchasing(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-slate rounded-2xl" />
            <div className="space-y-6">
              <div className="h-10 bg-slate rounded w-3/4" />
              <div className="h-6 bg-slate rounded w-1/4" />
              <div className="h-24 bg-slate rounded" />
              <div className="h-16 bg-slate rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!object) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Object Not Found</h2>
          <Link to="/explore" className="text-glow hover:underline">
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-mist hover:text-white mb-8 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 3D Viewer / Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {object?.modelUrl && (
  <Model3DViewer
    modelUrl={`https://dimension-server-bckr.onrender.com${object.modelUrl}`}
    className="aspect-square"
  />
)}
            
            {/* Thumbnail gallery */}
            <div className="flex gap-3 mt-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-glow">
                <img 
                  src={`https://dimension-server-bckr.onrender.com${object.thumbnailUrl}`} 
                  alt={object.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-20 h-20 rounded-xl bg-slate border border-white/10 flex items-center justify-center text-mist">
                3D
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-glow/10 text-glow capitalize">
              {object.category}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              {object.name}
            </h1>

            {/* Creator */}
            {object.creator && (
              <Link 
                to={`/profile/${object.creatorAddress}`}
                className="inline-flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-glow to-cyan flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {object.creator.username?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-mist">Creator</p>
                  <p className="font-medium group-hover:text-glow transition-colors">
                    {object.creator.username}
                  </p>
                </div>
              </Link>
            )}

            {/* Stats */}
            <div className="flex gap-6 py-4 border-y border-white/10">
              <div className="flex items-center gap-2 text-mist">
                <HiEye className="w-5 h-5" />
                <span>{object.views} views</span>
              </div>
              <div className="flex items-center gap-2 text-mist">
                <HiShoppingCart className="w-5 h-5" />
                <span>{object.purchases} sold</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-mist leading-relaxed">
                {object.description}
              </p>
            </div>

            {/* Price & Buy */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-mist">Current Price</span>
                <div className="flex items-center gap-3">
                  <FaEthereum className="w-6 h-6 text-cyan" />
                  <span className="text-3xl font-bold">{object.price} ETH</span>
                </div>
              </div>
              <p className="text-right text-mist text-sm">
                ≈ ${(parseFloat(object.price) * 2200).toFixed(2)} USD
              </p>

              {purchased ? (
                <button
                  className="w-full py-4 rounded-xl font-semibold bg-lime/20 text-lime flex items-center justify-center gap-2"
                >
                  <HiDownload className="w-5 h-5" />
                  Download Asset
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-glow via-purple-500 to-cyan text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isConnected ? (
                    'Buy Now'
                  ) : (
                    'Connect Wallet to Buy'
                  )}
                </button>
              )}

              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  <HiHeart className="w-5 h-5" />
                  Favorite
                </button>
                <button className="flex-1 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  <HiShare className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Details accordion */}
            <div className="glass rounded-2xl divide-y divide-white/10">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer">
                  <span className="font-medium">File Details</span>
                  <span className="text-mist group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-mist space-y-2">
                  <div className="flex justify-between">
                    <span>Format</span>
                    <span>GLB / GLTF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Polygons</span>
                    <span>~50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Textures</span>
                    <span>4K PBR</span>
                  </div>
                </div>
              </details>
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer">
                  <span className="font-medium">License</span>
                  <span className="text-mist group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-mist">
                  <p>Commercial use allowed. Attribution appreciated but not required.</p>
                </div>
              </details>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={closeWalletModal}
        onConnect={connectWithWallet}
        error={error}
        loading={walletLoading}
        onClearError={clearError}
      />
    </div>
  )
}


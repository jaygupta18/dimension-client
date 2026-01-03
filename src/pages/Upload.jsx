import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { HiUpload, HiPhotograph, HiCube, HiCheck, HiX } from 'react-icons/hi'
import { FaEthereum } from 'react-icons/fa'
import { useWallet } from '../context/WalletContext'
import WalletModal from '../components/WalletModal'
import FullNameModal from '../components/FullNameModal'

const categories = [
  { id: 'characters', label: 'Characters', icon: '🧙' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { id: 'architecture', label: 'Architecture', icon: '🏛️' },
  { id: 'nature', label: 'Nature', icon: '🌲' },
  { id: 'props', label: 'Props', icon: '🎮' },
  { id: 'abstract', label: 'Abstract', icon: '✨' },
]

export default function Upload() {
  const navigate = useNavigate()
  const { account, isConnected, openWalletModal, showFullnameModal, showWalletModal, closeWalletModal, closeFullnameModal, handleFullnameSubmit, connectWithWallet, error, loading, clearError } = useWallet()
  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    modelFile: null,
    thumbnailFile: null
  })

  const onModelDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, modelFile: acceptedFiles[0] }))
    }
  }, [])

  const onThumbnailDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, thumbnailFile: acceptedFiles[0] }))
    }
  }, [])

  const modelDropzone = useDropzone({
    onDrop: onModelDrop,
    accept: { 'model/gltf-binary': ['.glb'], 'model/gltf+json': ['.gltf'], 'model/obj': ['.obj'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  })

  const thumbnailDropzone = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  })

  const handleSubmit = async () => {
    if (!isConnected) {
      await connect()
      return
    }

    setUploading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', formData.price)
      data.append('category', formData.category)
      data.append('creatorAddress', account)
      data.append('model', formData.modelFile)
      data.append('thumbnail', formData.thumbnailFile)

      const res = await fetch('/api/objects', {
        method: 'POST',
        body: data
      })

      if (!res.ok) throw new Error('Upload failed')

      const object = await res.json()
      navigate(`/object/${object._id}`)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.modelFile && formData.thumbnailFile
      case 2:
        return formData.name && formData.description && formData.category
      case 3:
        return formData.price && parseFloat(formData.price) > 0
      default:
        return false
    }
  }

  if (!isConnected) {
    return (
      <>
        <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center glass rounded-2xl p-12 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-glow to-cyan flex items-center justify-center">
              <HiUpload className="w-10 h-10" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-mist mb-8">
              Sign in with your wallet to start uploading and selling your 3D assets.
            </p>
            <button
              type="button"
              onClick={openWalletModal}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-glow via-purple-500 to-cyan text-white hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
          </div>
        </div>
        <FullNameModal
          isOpen={showFullnameModal}
          onClose={closeFullnameModal}
          onSubmit={handleFullnameSubmit}
        />
        <WalletModal
          isOpen={showWalletModal}
          onClose={closeWalletModal}
          onConnect={connectWithWallet}
          error={error}
          loading={loading}
          onClearError={clearError}
        />
      </>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold mb-3">
            Create <span className="gradient-text">New Asset</span>
          </h1>
          <p className="text-mist">Upload your 3D model and start earning crypto</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s ? 'bg-gradient-to-br from-glow to-cyan text-white' : 'bg-slate text-mist'
              }`}>
                {step > s ? <HiCheck className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 sm:w-32 h-1 mx-2 rounded transition-all ${
                  step > s ? 'bg-glow' : 'bg-slate'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-8"
        >
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">Upload Files</h2>

              {/* Model Upload */}
              <div>
                <label className="block font-medium mb-3">3D Model File</label>
                <div
                  {...modelDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    modelDropzone.isDragActive ? 'border-glow bg-glow/10' : 'border-white/10 hover:border-white/30'
                  } ${formData.modelFile ? 'border-lime bg-lime/10' : ''}`}
                >
                  <input {...modelDropzone.getInputProps()} />
                  {formData.modelFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <HiCube className="w-8 h-8 text-lime" />
                      <span className="font-medium">{formData.modelFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData(prev => ({ ...prev, modelFile: null }))
                        }}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <HiCube className="w-12 h-12 mx-auto text-mist mb-3" />
                      <p className="text-mist">
                        Drag & drop or <span className="text-glow">browse</span>
                      </p>
                      <p className="text-sm text-mist/60 mt-2">GLB, GLTF, OBJ (max 50MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block font-medium mb-3">Thumbnail Image</label>
                <div
                  {...thumbnailDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    thumbnailDropzone.isDragActive ? 'border-glow bg-glow/10' : 'border-white/10 hover:border-white/30'
                  } ${formData.thumbnailFile ? 'border-lime bg-lime/10' : ''}`}
                >
                  <input {...thumbnailDropzone.getInputProps()} />
                  {formData.thumbnailFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={URL.createObjectURL(formData.thumbnailFile)}
                        alt="Thumbnail preview"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <span className="font-medium">{formData.thumbnailFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFormData(prev => ({ ...prev, thumbnailFile: null }))
                        }}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <HiPhotograph className="w-12 h-12 mx-auto text-mist mb-3" />
                      <p className="text-mist">
                        Drag & drop or <span className="text-glow">browse</span>
                      </p>
                      <p className="text-sm text-mist/60 mt-2">PNG, JPG, WebP (max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Asset Details</h2>

              <div>
                <label className="block font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Cyber Warrior"
                  className="w-full px-4 py-3 bg-slate border border-white/10 rounded-xl text-white placeholder-mist focus:outline-none focus:border-glow/50"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your 3D asset..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate border border-white/10 rounded-xl text-white placeholder-mist focus:outline-none focus:border-glow/50 resize-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-3">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.category === cat.id
                          ? 'border-glow bg-glow/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Set Your Price</h2>

              <div>
                <label className="block font-medium mb-2">Price in ETH</label>
                <div className="relative">
                  <FaEthereum className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan" />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-4 bg-slate border border-white/10 rounded-xl text-white text-2xl placeholder-mist focus:outline-none focus:border-glow/50"
                  />
                </div>
                {formData.price && (
                  <p className="text-mist mt-2">
                    ≈ ${(parseFloat(formData.price) * 2200).toFixed(2)} USD
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-ember/10 border border-ember/20">
                <p className="text-sm text-ember">
                  <strong>Platform Fee:</strong> 2.5% of each sale goes to Dimension Market.
                </p>
              </div>

              {/* Summary */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <h3 className="font-semibold mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mist">Asset Name</span>
                    <span>{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist">Category</span>
                    <span className="capitalize">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist">Model File</span>
                    <span>{formData.modelFile?.name}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-white/10">
                    <span>Price</span>
                    <span>{formData.price} ETH</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/5 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
              disabled={!canProceed() || uploading}
              className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-glow via-purple-500 to-cyan text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </span>
              ) : step < 3 ? (
                'Continue'
              ) : (
                'Create Asset'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


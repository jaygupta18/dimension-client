import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiEye, HiShoppingCart } from 'react-icons/hi'
import { FaEthereum } from 'react-icons/fa'

export default function ObjectCard({ object, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/object/${object._id}`} className="block group">
        <div className="relative glass rounded-2xl overflow-hidden card-hover">
          {/* Thumbnail */}
          <div className="aspect-square relative overflow-hidden">
            <img
              src={`https://dimension-server-bckr.onrender.com${object.thumbnailUrl}` || 'https://picsum.photos/400/400'}
              alt={object.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Quick stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
              <div className="flex items-center gap-2 text-sm">
                <HiEye className="w-4 h-4" />
                <span>{object.views || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HiShoppingCart className="w-4 h-4" />
                <span>{object.purchases || 0} sold</span>
              </div>
            </div>

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-void/60 backdrop-blur-sm border border-white/10 capitalize">
                {object.category}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-glow transition-colors truncate">
              {object.name}
            </h3>
            <p className="text-mist text-sm mb-3 line-clamp-2 h-10">
              {object.description}
            </p>
            
            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate flex items-center justify-center">
                  <FaEthereum className="w-3.5 h-3.5 text-cyan" />
                </div>
                <span className="font-semibold">{object.price} ETH</span>
              </div>
              <span className="text-xs text-mist">
                ~${(parseFloat(object.price) * 2200).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}


import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, X } from 'lucide-react'

interface FilterBarProps {
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  onClearFilters: () => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onClearFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
      {/* Filter button */}
      <button 
        onClick={toggleExpand}
        className={`p-2 rounded-md ${
          selectedTags.length > 0 ? 'text-neon-blue' : 'text-gray-400'
        } hover:bg-dark-700/50 transition-colors relative`}
      >
        <Filter className="w-5 h-5" />
        {selectedTags.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-blue rounded-full text-dark-900 text-xs flex items-center justify-center">
            {selectedTags.length}
          </span>
        )}
      </button>

      {/* Filter dropdown */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-full right-0 bg-dark-800 border border-dark-600 rounded-lg mt-2 overflow-hidden shadow-lg w-64"
      >
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Filter by tags</h4>
            {selectedTags.length > 0 && (
              <button 
                onClick={onClearFilters}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-400 mb-2">Selected:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <div 
                    key={tag} 
                    className="px-2 py-1 bg-neon-blue/20 border border-neon-blue/30 rounded-full text-xs text-neon-blue flex items-center"
                  >
                    {tag}
                    <button 
                      onClick={() => onTagRemove(tag)}
                      className="ml-1 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available tags */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Available tags:</div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                  <button 
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    className="px-2 py-1 bg-dark-700 rounded-full text-xs text-gray-300 hover:bg-dark-600 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 
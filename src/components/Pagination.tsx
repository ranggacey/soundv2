import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    
    // Always show first page
    if (currentPage > 3) {
      pages.push(1)
    }
    
    // Show ellipsis if needed
    if (currentPage > 4) {
      pages.push('...')
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
      pages.push('...')
    }
    
    // Always show last page
    if (currentPage < totalPages - 2 && totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-1 py-4">
      {/* Previous button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-8 h-8 flex items-center justify-center rounded-md ${
          currentPage === 1 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-gray-400 hover:bg-dark-700 hover:text-white'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                currentPage === page
                  ? 'bg-neon-blue text-dark-900'
                  : 'text-gray-400 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {page}
            </motion.button>
          )}
        </React.Fragment>
      ))}
      
      {/* Next button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-8 h-8 flex items-center justify-center rounded-md ${
          currentPage === totalPages 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-gray-400 hover:bg-dark-700 hover:text-white'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
} 
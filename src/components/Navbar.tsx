import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, Map, Upload, Home, Menu, X } from 'lucide-react'

interface NavbarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Map },
    { id: 'upload', label: 'Upload', icon: Upload },
  ]

  const handleNavigate = (page: string) => {
    onNavigate(page)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => handleNavigate('home')}
            >
              <div className="relative">
                <Volume2 className="w-8 h-8 text-neon-blue" />
                <motion.div
                  className="absolute inset-0 w-8 h-8 bg-neon-blue/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xl font-bold text-white">SoundScape</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'text-gray-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 bg-dark-700 border border-dark-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:border-neon-blue/30 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-dark-900/95 backdrop-blur-md border-l border-dark-700 z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-6 h-6 text-neon-blue" />
                    <span className="text-lg font-bold text-white">SoundScape</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 bg-dark-700 border border-dark-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:border-neon-blue/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Mobile Navigation Items */}
                <div className="flex-1 px-6 py-8">
                  <div className="space-y-4">
                    {navItems.map((item, index) => {
                      const Icon = item.icon
                      const isActive = currentPage === item.id
                      
                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigate(item.id)}
                          className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                              : 'text-gray-300 hover:text-white hover:bg-dark-700/50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium text-lg">{item.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-dark-700">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      Discover sounds from around the world
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-3">
                      <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
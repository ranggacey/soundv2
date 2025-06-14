import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, Map, Upload, Globe, Headphones, Users } from 'lucide-react'

interface HomePageProps {
  onNavigate: (page: string) => void
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Globe,
      title: 'Global Discovery',
      description: 'Explore unique sounds from every corner of the world'
    },
    {
      icon: Headphones,
      title: 'Immersive Audio',
      description: 'High-quality audio experiences with spatial context'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Share and discover sounds from fellow explorers'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(0, 255, 136, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-neon-blue/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            {/* Logo Animation */}
            <motion.div
              className="flex items-center justify-center space-x-4 mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <Volume2 className="w-16 h-16 text-neon-blue" />
                <motion.div
                  className="absolute inset-0 w-16 h-16 bg-neon-blue/20 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-blue via-neon-green to-neon-purple bg-clip-text text-transparent">
              SoundScape
            </h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Discover the world through sound. Record, share, and explore unique audio experiences from every corner of our planet.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('explore')}
                className="bg-gradient-to-r from-neon-blue to-neon-green px-8 py-4 rounded-full text-lg font-semibold text-dark-900 hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Map className="w-5 h-5" />
                <span>Explore Sounds</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('upload')}
                className="border-2 border-neon-blue text-neon-blue px-8 py-4 rounded-full text-lg font-semibold hover:bg-neon-blue/10 transition-all duration-300 flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Share a Sound</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-neon-blue rounded-full mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Experience the World's
              <span className="bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent"> Soundscape</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From bustling city streets to serene natural environments, discover the unique audio fingerprint of every location on Earth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="bg-dark-800/50 backdrop-blur-sm border border-dark-600 rounded-xl p-8 text-center hover:border-neon-blue/30 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-neon-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-dark-800/50 to-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-2xl p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to explore the world through sound?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of audio explorers discovering unique sounds from around the globe.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('explore')}
            className="bg-gradient-to-r from-neon-blue to-neon-green px-10 py-4 rounded-full text-lg font-semibold text-dark-900 hover:shadow-lg transition-all duration-300"
          >
            Start Exploring
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}
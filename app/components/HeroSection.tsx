'use client';

import { motion } from 'motion/react';
import { TrendingUp, Wind, Droplets, Thermometer, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';

export function HeroSection() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 p-8 md:p-12">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            style={{
              left: `${10 + i * 12}%`,
              bottom: '10%'
            }}
          />
        ))}

        <svg className="absolute bottom-0 left-0 w-full h-full opacity-20" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <motion.path
            d="M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z"
            fill="url(#wave-gradient-1)"
            animate={{
              d: [
                "M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z",
                "M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z",
                "M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
            fill="url(#wave-gradient-2)"
            animate={{
              d: [
                "M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z",
                "M0,250 Q300,220 600,250 T1200,250 L1200,400 L0,400 Z",
                "M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-600" />
                <h1 className="text-gray-900">Arpoador, Rio de Janeiro</h1>
              </div>
              <motion.div
                className="px-4 py-2 bg-white rounded-full shadow-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </motion.div>
              <motion.div
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm text-sm"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔥 Vai Agora!
              </motion.div>
            </div>
            <p className="text-gray-600 max-w-2xl mb-3">
              <strong className="text-gray-900">Condições excelentes!</strong> Perfeito para surfistas intermediários e avançados. Clássicas direitas do Arpoador com vento offshore.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Atualizado há 2 min • Melhor janela: Próximas 3 horas • 🇧🇷 Horário local: 14:15</span>
            </div>
          </div>

          {/* Surfability Score - Interactive */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg min-w-[160px] cursor-pointer"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            <div className="text-center">
              <motion.div 
                className="text-5xl mb-1 bg-gradient-to-br from-cyan-500 to-blue-600 bg-clip-text text-transparent"
                animate={isHovering ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                8.5
              </motion.div>
              <div className="text-sm text-gray-500 mb-1">Surfabilidade</div>
              <motion.div 
                className="inline-block px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs mb-3"
                animate={{ scale: isHovering ? 1.05 : 1 }}
              >
                Excelente
              </motion.div>
              <div className="flex gap-0.5 justify-center">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-6 rounded-full ${
                      i < 8 ? 'bg-gradient-to-t from-cyan-400 to-blue-500' : 'bg-gray-200'
                    }`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ scaleY: 1.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary Tags - Interactive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-cyan-400 transition-colors"
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <span className="text-xs text-gray-500">Swell Principal</span>
            </div>
            <div className="text-gray-900">1.3m @ 12s</div>
            <div className="text-xs text-cyan-600 mt-0.5">ESE • Organizado</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-teal-400 transition-colors"
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-teal-600" />
              <span className="text-xs text-gray-500">Vento</span>
            </div>
            <div className="text-gray-900">12 km/h</div>
            <div className="text-xs text-teal-600 mt-0.5">✓ Offshore O</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-blue-400 transition-colors"
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Maré</span>
            </div>
            <div className="text-gray-900">Enchendo</div>
            <div className="text-xs text-blue-600 mt-0.5">↑ Alta às 14:30</div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-cyan-400 transition-colors"
            whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-cyan-600" />
              <span className="text-xs text-gray-500">Temp. da Água</span>
            </div>
            <div className="text-gray-900">24°C</div>
            <div className="text-xs text-teal-600 mt-0.5">Sunga</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

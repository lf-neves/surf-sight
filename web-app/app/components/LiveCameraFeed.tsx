'use client';

import { motion } from 'motion/react';
import { Video, Maximize2, Radio, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';

export function LiveCameraFeed() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(0);
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);

  const cameras = [
    { name: 'Câmera Principal', angle: 'Vista geral', quality: 'HD' },
    { name: 'Câmera Lateral', angle: 'Vista lateral', quality: 'HD' },
    { name: 'Câmera Aérea', angle: 'Vista completa', quality: '4K' },
  ];

  if (!selectedSpot) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-gray-700 font-medium">Transmissão ao Vivo</h2>
        <p className="text-sm text-gray-500 mt-1">Selecione um pico para ver câmeras (quando disponível).</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-gray-900">Transmissão ao Vivo</h2>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radio className="w-3 h-3" />
                  AO VIVO
                </motion.div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3" />
                {selectedSpot.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-gradient-to-br from-blue-900 to-cyan-900 aspect-video">
        {/* Simulated video feed with animated elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
          {/* Animated ocean waves simulation */}
          <svg className="absolute bottom-0 left-0 w-full h-1/2 opacity-30" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <motion.path
              d="M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z"
              fill="url(#liveWaveGradient)"
              animate={{
                d: [
                  "M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z",
                  "M0,150 Q300,120 600,150 T1200,150 L1200,300 L0,300 Z",
                  "M0,150 Q300,100 600,150 T1200,150 L1200,300 L0,300 Z"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <defs>
              <linearGradient id="liveWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Surfing figures animation */}
          <motion.div
            className="absolute text-6xl"
            animate={{
              x: ['10%', '80%'],
              y: ['50%', '45%', '50%']
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            🏄‍♂️
          </motion.div>

          <motion.div
            className="absolute text-5xl"
            animate={{
              x: ['70%', '5%'],
              y: ['60%', '55%', '60%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
          >
            🏄‍♀️
          </motion.div>
        </div>

        {/* Overlay Info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm">
              1.3m @ 12s
            </div>
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm">
              12 km/h Offshore
            </div>
          </div>
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              {cameras.map((camera, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedCamera(index)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedCamera === index
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div>{camera.name}</div>
                  <div className="text-xs opacity-80">{camera.angle}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Live viewer count */}
        <div className="absolute top-4 right-4">
          <motion.div
            className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm flex items-center gap-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>347 assistindo</span>
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Qualidade: <span className="text-gray-900">{cameras[selectedCamera].quality}</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-cyan-600 hover:text-cyan-700">
            Compartilhar
          </button>
          <button className="text-cyan-600 hover:text-cyan-700">
            Histórico de 24h
          </button>
        </div>
      </div>
    </div>
  );
}

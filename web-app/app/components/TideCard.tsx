'use client';

import { motion } from 'motion/react';
import { Droplets } from 'lucide-react';
import { useState } from 'react';

export function TideCard() {
  const [isHovering, setIsHovering] = useState(false);

  // Mock tide data (height in meters)
  const tideData = [
    { time: 0, height: 1.2, label: '12 AM' },
    { time: 3, height: 0.4, label: '3 AM', type: 'low' },
    { time: 6, height: 1.5, label: '6 AM' },
    { time: 9, height: 1.8, label: '9 AM', type: 'high' },
    { time: 12, height: 1.0, label: '12 PM' },
    { time: 15, height: 0.3, label: '3 PM', type: 'low' },
    { time: 18, height: 1.4, label: '6 PM' },
    { time: 21, height: 1.9, label: '9 PM', type: 'high' },
    { time: 24, height: 1.2, label: '12 AM' },
  ];

  const maxHeight = 2.0;

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
          <Droplets className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-gray-900">Maré</h3>
      </div>

      {/* Tide Curve */}
      <div className="relative h-32 mb-4">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="30"
            x2="400"
            y2="30"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="60"
            x2="400"
            y2="60"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="90"
            x2="400"
            y2="90"
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Tide curve path */}
          <motion.path
            d={`M ${tideData
              .map((d, i) => {
                const x = (i / (tideData.length - 1)) * 400;
                const y = 110 - (d.height / maxHeight) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              })
              .join(' ')}`}
            fill="none"
            stroke="url(#tide-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Fill under curve */}
          <motion.path
            d={`M ${tideData
              .map((d, i) => {
                const x = (i / (tideData.length - 1)) * 400;
                const y = 110 - (d.height / maxHeight) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              })
              .join(' ')} L 400,120 L 0,120 Z`}
            fill="url(#tide-fill-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Current time marker */}
          <line
            x1="200"
            y1="0"
            x2="200"
            y2="120"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          <defs>
            <linearGradient
              id="tide-gradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient
              id="tide-fill-gradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Tide Times */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <div>
            <div className="text-xs text-gray-500">Maré Alta</div>
            <div className="text-gray-900">09:00</div>
          </div>
          <div className="text-blue-600">1.8m</div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div>
            <div className="text-xs text-gray-500">Maré Baixa</div>
            <div className="text-gray-900">15:00</div>
          </div>
          <div className="text-gray-600">0.3m</div>
        </div>

        <div className="flex items-center justify-between bg-cyan-50 rounded-lg p-3">
          <div>
            <div className="text-xs text-gray-500">Próxima Alta</div>
            <div className="text-gray-900">21:00</div>
          </div>
          <div className="text-cyan-600">1.9m</div>
        </div>
      </div>

      <motion.div
        className="mt-4 text-xs text-center"
        animate={isHovering ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="text-blue-600 mb-1">↑ Enchendo agora • Maré média</div>
        <div className="text-gray-600">
          🎯 <strong>Melhor Horário:</strong> Em 30 minutos (maré alta)
        </div>
      </motion.div>
    </motion.div>
  );
}

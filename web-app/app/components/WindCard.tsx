'use client';

import { motion } from 'motion/react';
import { Wind, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useLatestForecastForSpotQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  windSpeedToKmh,
  degreesToDirection,
} from '@/lib/utils/forecast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface WindCardProps {
  spotId: string;
}

export function WindCard({ spotId }: WindCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { data, loading } = useLatestForecastForSpotQuery({
    variables: { spotId },
    skip: !spotId,
  });

  // Get the latest forecast
  const latestForecast = data?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  const windSpeed = parsed ? Math.round(windSpeedToKmh(parsed.windSpeed)) : 12;
  const windDirection = parsed?.windDirection || 270;
  const directionName = parsed ? degreesToDirection(parsed.windDirection) : 'Oeste';
  
  // Simplified: assume offshore if wind is from west (270°) - this should be based on spot orientation
  const isOffshore = windDirection >= 250 && windDirection <= 290;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className={`rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
        isOffshore 
          ? 'bg-gradient-to-br from-teal-50 to-cyan-50' 
          : 'bg-gradient-to-br from-orange-50 to-red-50'
      }`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isOffshore ? 'bg-white/80' : 'bg-white/80'
        }`}>
          <Wind className={`w-4 h-4 ${isOffshore ? 'text-teal-600' : 'text-orange-600'}`} />
        </div>
        <h3 className="text-gray-900">Vento</h3>
      </div>

      {/* Wind Arrow */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-2 border-white/50 rounded-full"></div>
          
          {/* Compass Points */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-gray-500">N</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-500">S</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-500">W</div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-500">E</div>

          {/* Direction Arrow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: windDirection }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <ArrowUp className={`w-10 h-10 ${isOffshore ? 'text-teal-600' : 'text-orange-600'}`} />
          </motion.div>
        </div>
      </div>

      {/* Wind Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl text-gray-900">{windSpeed}</span>
          <span className="text-gray-600">km/h</span>
        </div>
        <div className={`text-sm mb-1 ${isOffshore ? 'text-teal-700' : 'text-orange-700'}`}>
          {directionName} ({Math.round(windDirection)}°)
        </div>
        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
          isOffshore 
            ? 'bg-teal-100 text-teal-700' 
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isOffshore ? '✓ Offshore' : 'Onshore'}
        </div>
      </div>

      <motion.div 
        className="mt-3 text-xs text-center"
        animate={isHovering ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 0.5, repeat: isHovering ? Infinity : 0 }}
      >
        <div className={`${isOffshore ? 'text-teal-700' : 'text-orange-700'}`}>
          {isOffshore 
            ? '✨ Perfeito - Penteando as ondas!' 
            : '⚠️ Condições picadas esperadas'}
        </div>
        <div className="text-gray-500 mt-1">
          {isOffshore 
            ? 'Paredes limpas para manobras radicais' 
            : 'Melhor para longboard'}
        </div>
      </motion.div>
    </motion.div>
  );
}

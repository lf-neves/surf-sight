'use client';

import { motion } from 'motion/react';
import { TrendingUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { useLatestForecastForSpotQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  degreesToDirection,
} from '@/lib/utils/forecast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SwellCardProps {
  spotId: string;
}

export function SwellCard({ spotId }: SwellCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, loading } = useLatestForecastForSpotQuery({
    variables: { spotId },
    skip: !spotId,
  });

  // Get the latest forecast
  const latestForecast = data?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  const swellHeight = parsed?.swellHeight || parsed?.waveHeight || 1.3;
  const swellPeriod = parsed?.swellPeriod || parsed?.wavePeriod || 12;
  const swellDirection = parsed?.swellDirection || parsed?.waveDirection || 112.5;
  const directionDegrees = swellDirection;
  const directionName = degreesToDirection(swellDirection);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      whileHover={{ y: -4 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
        </div>
        <h3 className="text-gray-900">Ondulação</h3>
      </div>

      {/* Direction Compass */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
          <div className="absolute inset-2 border border-gray-50 rounded-full"></div>
          
          {/* Compass Points */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-gray-400">N</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-400">S</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">W</div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">E</div>

          {/* Direction Arrow */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: directionDegrees }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <ArrowDown className="w-8 h-8 text-cyan-600" />
          </motion.div>
        </div>
      </div>

      {/* Primary Swell */}
      <motion.div 
        className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 mb-3"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-xs text-gray-500 mb-1">Swell Principal</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl text-gray-900">{swellHeight.toFixed(1)}m</span>
          <span className="text-gray-600">@ {swellPeriod}s</span>
        </div>
        <div className="text-sm text-cyan-600 mt-1">{directionName} ({Math.round(directionDegrees)}°)</div>
        <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
          ✓ <span>Potente & Organizada</span>
        </div>
      </motion.div>

      {/* Secondary Swell */}
      <motion.div 
        className="bg-gray-50 rounded-xl p-4"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-xs text-gray-500 mb-1">Swell Secundário</div>
        <div className="flex items-baseline gap-2">
          <span className="text-gray-900">0.8m</span>
          <span className="text-gray-600 text-sm">@ 8s</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">S (180°)</div>
      </motion.div>

      {/* Expandable Details */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Parede da Onda:</span>
            <span className="text-gray-900">1.8 - 2.1m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Séries:</span>
            <span className="text-gray-900">A cada 10-12 min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qualidade:</span>
            <span className="text-green-600">Excelente</span>
          </div>
        </div>
      </motion.div>

      <div className="text-xs text-center text-gray-400 mt-3">
        {isExpanded ? '↑ Clique para recolher' : '↓ Clique para detalhes'}
      </div>
    </motion.div>
  );
}

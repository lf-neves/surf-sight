'use client';

import { motion } from 'motion/react';
import { Wind, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  windSpeedToKmh,
  degreesToDirection,
} from '@/lib/utils/forecast';
import { Card, AnimatedCard } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card-header';
import { CardContent } from '@/components/ui/card-content';
import { NoDataMessage } from './NoDataMessage';

export function WindCard() {
  const [isHovering, setIsHovering] = useState(false);
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  
  const { data } = useSpotWithForecastQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });
  
  if (!selectedSpot) {
    return null;
  }

  // Get the latest forecast
  const latestForecast = data?.spot?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  if (!parsed || !latestForecast || parsed.windSpeed === undefined || parsed.windDirection === undefined) {
    return (
      <Card>
        <NoDataMessage
          message="Dados de vento não disponíveis"
          noForecast={!!(data?.spot && !latestForecast)}
        />
      </Card>
    );
  }

  const windSpeed = Math.round(windSpeedToKmh(parsed.windSpeed));
  const windDirection = parsed.windDirection;
  const directionName = degreesToDirection(parsed.windDirection);
  
  // Simplified: assume offshore if wind is from west (270°) - this should be based on spot orientation
  const isOffshore = windDirection >= 250 && windDirection <= 290;

  return (
    <AnimatedCard
      variant="gradient"
      hoverable
      delay={0.2}
      gradient={isOffshore ? 'from-teal-50 to-cyan-50' : 'from-orange-50 to-red-50'}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <CardHeader 
        icon={Wind} 
        title="Vento"
        iconGradient="from-white/80 to-white/80"
        iconColor={isOffshore ? 'teal-600' : 'orange-600'}
      />

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
      <CardContent variant="glass">
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
      </CardContent>

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
    </AnimatedCard>
  );
}

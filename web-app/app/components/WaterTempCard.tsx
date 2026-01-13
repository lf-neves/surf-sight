'use client';

import { motion } from 'motion/react';
import { Thermometer } from 'lucide-react';
import { useState } from 'react';
import { useLatestForecastForSpotQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { parseForecastRaw } from '@/lib/utils/forecast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface WaterTempCardProps {
  spotId: string;
}

export function WaterTempCard({ spotId }: WaterTempCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { data, loading } = useLatestForecastForSpotQuery({
    variables: { spotId },
    skip: !spotId,
  });

  // Get the latest forecast
  const latestForecast = data?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;
  const temperature = parsed?.waterTemperature || 24; // Default to 24 if not available
  
  // Determine comfort level and color
  const getComfortInfo = (temp: number) => {
    if (temp < 15) return { level: 'Fria', color: 'from-blue-600 to-blue-400', bg: 'from-blue-100 to-cyan-100' };
    if (temp < 20) return { level: 'Fresca', color: 'from-cyan-600 to-teal-400', bg: 'from-cyan-100 to-teal-100' };
    if (temp < 24) return { level: 'Confortável', color: 'from-teal-600 to-green-400', bg: 'from-teal-100 to-green-100' };
    return { level: 'Quente', color: 'from-orange-600 to-red-400', bg: 'from-orange-100 to-red-100' };
  };

  const comfort = getComfortInfo(temperature);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${comfort.bg} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
          <Thermometer className="w-4 h-4 text-teal-600" />
        </div>
        <h3 className="text-gray-900">Temperatura da Água</h3>
      </div>

      {/* Temperature Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Thermometer Visual */}
          <div className="w-24 h-40 bg-white/50 rounded-full relative overflow-hidden">
            <motion.div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${comfort.color} rounded-full`}
              initial={{ height: '0%' }}
              animate={{ height: `${(temperature / 30) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl bg-gradient-to-br ${comfort.color} bg-clip-text text-transparent`}>
                  {temperature}°
                </div>
                <div className="text-xs text-gray-600">Celsius</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nível de Conforto</span>
          <span className={`text-sm bg-gradient-to-r ${comfort.color} bg-clip-text text-transparent`}>
            {comfort.level}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Roupa</span>
          <span className="text-sm text-gray-900">
            {temperature < 18 ? '3/2mm Completa' : temperature < 22 ? 'Spring Suit' : 'Sunga'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tendência</span>
          <span className="text-sm text-gray-900 flex items-center gap-1">
            <span>↑</span> +0.5° hoje
          </span>
        </div>
      </div>

      <motion.div 
        className="mt-4 text-xs text-center"
        animate={isHovering ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 0.5, repeat: isHovering ? Infinity : 0 }}
      >
        <div className="text-teal-700 mb-1">
          🌊 Perfeito para sessões longas
        </div>
        <div className="text-gray-600">
          <strong>Leve:</strong> Apenas sunga! 🌴
        </div>
      </motion.div>
    </motion.div>
  );
}

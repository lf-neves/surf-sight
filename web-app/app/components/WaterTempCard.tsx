'use client';

import { motion } from 'motion/react';
import { Thermometer } from 'lucide-react';
import { useState } from 'react';
import { AnimatedCard } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card-header';
import { CardContent } from '@/components/ui/card-content';

export function WaterTempCard() {
  const [isHovering, setIsHovering] = useState(false);
  const temperature = 24; // Warmer for Rio

  // Determine comfort level and color
  const getComfortInfo = (temp: number) => {
    if (temp < 15)
      return {
        level: 'Fria',
        color: 'from-blue-600 to-blue-400',
        bg: 'from-blue-100 to-cyan-100',
      };
    if (temp < 20)
      return {
        level: 'Fresca',
        color: 'from-cyan-600 to-teal-400',
        bg: 'from-cyan-100 to-teal-100',
      };
    if (temp < 24)
      return {
        level: 'Confortável',
        color: 'from-teal-600 to-green-400',
        bg: 'from-teal-100 to-green-100',
      };
    return {
      level: 'Quente',
      color: 'from-orange-600 to-red-400',
      bg: 'from-orange-100 to-red-100',
    };
  };

  const comfort = getComfortInfo(temperature);

  return (
    <AnimatedCard
      variant="gradient"
      hoverable
      delay={0.4}
      gradient={comfort.bg}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <CardHeader 
        icon={Thermometer} 
        title="Temperatura da Água"
        iconGradient="from-white/80 to-white/80"
        iconColor="teal-600"
      />

      {/* Temperature Display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Thermometer Visual */}
          <div className="w-24 h-40 bg-white/50 rounded-full relative overflow-hidden">
            <motion.div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${comfort.color} rounded-full`}
              initial={{ height: '0%' }}
              animate={{ height: `${(temperature / 30) * 100}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-4xl bg-gradient-to-br ${comfort.color} bg-clip-text text-transparent`}
                >
                  {temperature}°
                </div>
                <div className="text-xs text-gray-600">Celsius</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Details */}
      <CardContent variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nível de Conforto</span>
          <span
            className={`text-sm bg-gradient-to-r ${comfort.color} bg-clip-text text-transparent`}
          >
            {comfort.level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Roupa</span>
          <span className="text-sm text-gray-900">
            {temperature < 18
              ? '3/2mm Completa'
              : temperature < 22
                ? 'Spring Suit'
                : 'Sunga'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tendência</span>
          <span className="text-sm text-gray-900 flex items-center gap-1">
            <span>↑</span> +0.5° hoje
          </span>
        </div>
      </CardContent>

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
    </AnimatedCard>
  );
}

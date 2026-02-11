'use client';

import { motion } from 'motion/react';
import { Thermometer, Waves } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { parseForecastRaw } from '@/lib/utils/forecast';
import { AnimatedCard, Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card-header';
import { CardContent } from '@/components/ui/card-content';
import { NoDataMessage } from './NoDataMessage';

export function WaterTempCard() {
  const [isHovering, setIsHovering] = useState(false);
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);

  const { data } = useSpotWithForecastQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });

  if (!selectedSpot) {
    return null;
  }

  const latestForecast = data?.spot?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;
  const temperature = parsed?.waterTemperature;

  if (!temperature) {
    return (
      <Card>
        <CardHeader icon={Thermometer} title="Temperatura da Água" />
        <NoDataMessage
          message="Dados de temperatura não disponíveis"
          noForecast={!!(data?.spot && !data?.spot?.latestForecastForSpot)}
        />
      </Card>
    );
  }

  // Determine comfort level and color
  const getComfortInfo = (temp: number) => {
    if (temp < 15)
      return {
        level: 'Fria',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        recommendation: 'Wetsuit 4/3mm recomendado',
      };
    if (temp < 20)
      return {
        level: 'Fresca',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        iconColor: 'text-cyan-600',
        recommendation: 'Wetsuit 3/2mm ou Spring Suit',
      };
    if (temp < 24)
      return {
        level: 'Confortável',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        iconColor: 'text-teal-600',
        recommendation: 'Spring Suit ou Top',
      };
    return {
      level: 'Quente',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      recommendation: 'Apenas sunga! 🌴',
    };
  };

  const comfort = getComfortInfo(temperature);
  const wetsuitRecommendation =
    temperature < 18
      ? '3/2mm Completa'
      : temperature < 22
        ? 'Spring Suit'
        : 'Sunga';

  return (
    <AnimatedCard
      hoverable
      delay={0.4}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="relative overflow-hidden"
    >
      <CardHeader
        icon={Thermometer}
        title="Temperatura da Água"
        iconGradient="from-cyan-100 to-blue-100"
      />

      {/* Large Temperature Display */}
      <div className="flex items-center justify-center mb-6">
        <motion.div
          className={`relative ${comfort.bgColor} ${comfort.borderColor} border-2 rounded-2xl p-8 w-full`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-2">
                Temperatura Atual
              </div>
              <motion.div
                className={`text-5xl font-bold ${comfort.color} mb-1`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                {temperature.toFixed(1)}°
              </motion.div>
              <div className="text-sm text-gray-600">Celsius</div>
            </div>
            <motion.div
              className={`${comfort.iconColor} transition-transform`}
              animate={isHovering ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Thermometer className="w-16 h-16" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Temperature Details */}
      <CardContent variant="glass" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Nível de Conforto</span>
          <span className={`text-sm font-semibold ${comfort.color}`}>
            {comfort.level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Roupa Recomendada</span>
          <span className="text-sm font-medium text-gray-900">
            {wetsuitRecommendation}
          </span>
        </div>

        <motion.div
          className="pt-3 border-t border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-2">
            <Waves
              className={`w-4 h-4 ${comfort.iconColor} mt-0.5 flex-shrink-0`}
            />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Recomendação</div>
              <div className={`text-sm ${comfort.color} font-medium`}>
                {comfort.recommendation}
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>

      {/* Hover Message */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`text-xs ${comfort.color} font-medium`}>
          {temperature >= 24
            ? '🌊 Perfeito para sessões longas'
            : temperature >= 20
              ? '💧 Água confortável'
              : '🧊 Água fria - proteção necessária'}
        </div>
      </motion.div>
    </AnimatedCard>
  );
}

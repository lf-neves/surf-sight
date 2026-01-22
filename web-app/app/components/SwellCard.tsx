'use client';

import { motion } from 'motion/react';
import { TrendingUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  degreesToDirection,
} from '@/lib/utils/forecast';
import { Card, AnimatedCard } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card-header';
import { CardContent } from '@/components/ui/card-content';
import { NoDataMessage } from './NoDataMessage';

export function SwellCard() {
  const [isExpanded, setIsExpanded] = useState(false);
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

  if (!parsed || !latestForecast) {
    return (
      <Card>
        <NoDataMessage message="Dados de swell não disponíveis" />
      </Card>
    );
  }

  const swellHeight = parsed.swellHeight || parsed.waveHeight;
  const swellPeriod = parsed.swellPeriod || parsed.wavePeriod;
  const swellDirection = parsed.swellDirection || parsed.waveDirection;

  if (!swellHeight || !swellPeriod || swellDirection === undefined) {
    return (
      <Card>
        <NoDataMessage message="Dados de swell não disponíveis" />
      </Card>
    );
  }

  const directionDegrees = swellDirection;
  const directionName = degreesToDirection(swellDirection);

  return (
    <AnimatedCard
      hoverable
      delay={0.1}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader icon={TrendingUp} title="Ondulação" />

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
      <motion.div whileHover={{ scale: 1.02 }} className="mb-3">
        <CardContent variant="gradient" gradient="from-cyan-50 to-blue-50">
          <div className="text-xs text-gray-500 mb-1">Swell Principal</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-gray-900">{swellHeight.toFixed(1)}m</span>
            <span className="text-gray-600">@ {swellPeriod}s</span>
          </div>
          <div className="text-sm text-cyan-600 mt-1">{directionName} ({Math.round(directionDegrees)}°)</div>
          <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
            ✓ <span>Potente & Organizada</span>
          </div>
        </CardContent>
      </motion.div>

      {/* Secondary Swell - Show only if we have data, otherwise show message */}
      <motion.div whileHover={{ scale: 1.02 }}>
        <CardContent variant="gradient" gradient="from-gray-50 to-gray-50">
          <div className="text-xs text-gray-500 mb-1">Swell Secundário</div>
          <div className="text-sm text-gray-500 italic">Não disponível nos dados atuais</div>
        </CardContent>
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
            <span className="text-gray-900">~{(swellHeight * 1.5).toFixed(1)}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Séries:</span>
            <span className="text-gray-900">A cada {Math.round(swellPeriod * 0.8)}-{Math.round(swellPeriod * 1.2)} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qualidade:</span>
            <span className="text-green-600">
              {swellPeriod >= 12 ? 'Excelente' : swellPeriod >= 10 ? 'Boa' : 'Regular'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="text-xs text-center text-gray-400 mt-3">
        {isExpanded ? '↑ Clique para recolher' : '↓ Clique para detalhes'}
      </div>
    </AnimatedCard>
  );
}

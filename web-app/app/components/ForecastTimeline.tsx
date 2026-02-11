'use client';

import { motion } from 'motion/react';
import { TrendingUp, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { parseForecastRaw, windSpeedToKmh, degreesToDirection, calculateSurfabilityScore } from '@/lib/utils/forecast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ForecastTimeline() {
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  const { data } = useSpotWithForecastQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });

  const latestForecast = data?.spot?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  if (!selectedSpot) {
    return null;
  }

  if (!parsed || !latestForecast) {
    return (
      <Card className="p-6">
        <h2 className="text-gray-900 mb-2">Previsão por Hora</h2>
        <p className="text-sm text-gray-500">Previsão horária em breve para {selectedSpot.name}.</p>
      </Card>
    );
  }

  const time = parsed.time ? format(parsed.time, "H'h'", { locale: ptBR }) : '—';
  const swellHeight = parsed.swellHeight ?? parsed.waveHeight ?? 0;
  const swellPeriod = parsed.swellPeriod ?? parsed.wavePeriod ?? 0;
  const windSpeed = Math.round(windSpeedToKmh(parsed.windSpeed));
  const windDir = degreesToDirection(parsed.windDirection);
  const score = Math.min(10, Math.max(0, calculateSurfabilityScore(parsed)));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Previsão atual</h2>
        <span className="text-sm text-gray-500">{selectedSpot.name}</span>
      </div>
      <motion.div
        className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-900">{time}</span>
          <div className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs">
            {score.toFixed(1)}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-cyan-600" />
            <span className="text-xs text-gray-600">{swellHeight.toFixed(1)}m @ {swellPeriod.toFixed(0)}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3 h-3 text-teal-600" />
            <span className="text-xs text-gray-600">{windSpeed} km/h {windDir}</span>
          </div>
        </div>
      </motion.div>
      <p className="text-xs text-gray-500 mt-4 text-center">Previsão por hora (próximas 8h) em breve</p>
    </div>
  );
}

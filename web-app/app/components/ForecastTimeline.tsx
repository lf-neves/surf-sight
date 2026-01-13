'use client';

import { motion } from 'motion/react';
import { TrendingUp, Wind } from 'lucide-react';
import { useForecastsForSpot } from '@/lib/hooks/useForecastsForSpot';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ForecastTimelineProps {
  spotId: string;
  nextHours?: number;
}

export function ForecastTimeline({ spotId, nextHours = 8 }: ForecastTimelineProps) {
  const { forecasts, loading, error } = useForecastsForSpot({
    spotId,
    nextHours,
  });

  // Use only the requested number of hours
  const forecast = forecasts.slice(0, nextHours);

  const maxSwell = forecast.length > 0 ? Math.max(...forecast.map(f => f.swellHeight)) : 1;

  if (loading) {
    return <LoadingSpinner message="Carregando previsão..." />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center text-red-500">Erro ao carregar previsão</div>
      </div>
    );
  }

  if (forecast.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center text-gray-500">Nenhuma previsão disponível</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Previsão por Hora</h2>
        <span className="text-sm text-gray-500">Próximas {forecast.length} horas</span>
      </div>

      {/* Scrollable Timeline */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-3 min-w-max">
          {forecast.map((hour, index) => (
            <motion.div
              key={hour.id}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 min-w-[140px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            >
              {/* Time & Score */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-900">{hour.formattedTime}</span>
                <div className="px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs">
                  {hour.surfabilityScore.toFixed(1)}
                </div>
              </div>

              {/* Mini Swell Chart */}
              <div className="mb-3">
                <div className="flex items-end gap-0.5 h-12 mb-2">
                  {[...Array(8)].map((_, i) => {
                    const height = ((hour.swellHeight + Math.sin(i * 0.8) * 0.2) / maxSwell) * 100;
                    return (
                      <motion.div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-cyan-400 to-blue-400 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: index * 0.05 + i * 0.02, duration: 0.3 }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Swell Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-cyan-600" />
                  <span className="text-xs text-gray-600">
                    {hour.swellHeight}m @ {hour.swellPeriod}s
                  </span>
                </div>

                {/* Wind Info */}
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-teal-600" />
                  <span className="text-xs text-gray-600">
                    {hour.windSpeed} km/h {hour.windDirectionName}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-400 rounded"></div>
          <span className="text-xs text-gray-500">Altura do Swell</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Nota de Surfabilidade</span>
        </div>
      </div>
    </div>
  );
}

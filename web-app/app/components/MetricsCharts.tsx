'use client';

import { motion } from 'motion/react';
import { TrendingUp, Wind, Waves } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppSelector } from '@/lib/store/hooks';
import { useForecastsForSpot } from '@/lib/hooks/useForecastsForSpot';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NEXT_HOURS_7_DAYS = 24 * 7;

export function MetricsCharts() {
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  const { forecasts, loading, error } = useForecastsForSpot({
    spotId: selectedSpot?.id ?? '',
    nextHours: NEXT_HOURS_7_DAYS,
    skip: !selectedSpot?.id,
  });

  if (!selectedSpot) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <h2 className="text-gray-900 mb-2">Métricas Detalhadas</h2>
        <p className="text-sm text-gray-500">Selecione um pico na barra de busca para ver gráficos de previsão.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-gray-500 text-sm">Carregando previsão...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <h2 className="text-gray-900 mb-2">Métricas Detalhadas</h2>
        <p className="text-sm text-red-600">Erro ao carregar previsão. Tente novamente.</p>
      </div>
    );
  }

  const chartData = forecasts.map((f) => ({
    time: format(f.timestamp, 'dd/MM HH:mm', { locale: ptBR }),
    timestamp: f.timestamp.getTime(),
    swellHeight: f.swellHeight,
    windSpeed: f.windSpeed,
    waterTemp: f.waterTemperature ?? null,
  }));

  const hasData = chartData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Métricas Detalhadas</h2>
        <p className="text-sm text-gray-600">
          Previsão para <strong>{selectedSpot.name}</strong>
          {hasData ? ` (${forecasts.length} pontos)` : ''}
        </p>
      </div>

      {!hasData ? (
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[200px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-6 text-gray-400">
            <Waves className="w-10 h-10" />
            <Wind className="w-10 h-10" />
            <TrendingUp className="w-10 h-10" />
          </div>
          <p className="text-gray-500 text-sm">
            Não há previsão estendida para este pico no período. Os gráficos aparecerão quando houver mais pontos de previsão.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  yAxisId="swell"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Ondas (m)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="wind"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Vento (km/h)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.time}
                  formatter={(value: number, name: string) => [
                    name.startsWith('Altura') ? `${Number(value)?.toFixed(1)} m` : `${value} km/h`,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="swell"
                  type="monotone"
                  dataKey="swellHeight"
                  name="Altura das ondas (m)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
                <Line
                  yAxisId="wind"
                  type="monotone"
                  dataKey="windSpeed"
                  name="Vento (km/h)"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}

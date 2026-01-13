'use client';

import { motion } from 'motion/react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wind, Waves, Clock } from 'lucide-react';
import { useForecastsForSpot } from '@/lib/hooks/useForecastsForSpot';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MetricsChartsProps {
  spotId: string;
}

export function MetricsCharts({ spotId }: MetricsChartsProps) {
  const { forecasts, loading, error } = useForecastsForSpot({
    spotId,
    nextHours: 168, // 7 days * 24 hours
  });

  // Group forecasts by day and calculate averages
  const forecastsByDay = new Map<string, {
    height: number[];
    period: number[];
    windSpeed: number[];
    score: number[];
  }>();

  forecasts.forEach((forecast) => {
    const dayKey = forecast.dayName;
    
    if (!forecastsByDay.has(dayKey)) {
      forecastsByDay.set(dayKey, { height: [], period: [], windSpeed: [], score: [] });
    }
    
    const dayData = forecastsByDay.get(dayKey)!;
    dayData.height.push(forecast.swellHeight);
    dayData.period.push(forecast.swellPeriod);
    dayData.windSpeed.push(forecast.windSpeed);
    dayData.score.push(forecast.surfabilityScore);
  });

  // Convert to chart data format
  // Get all unique days from forecasts, sorted
  const uniqueDays = Array.from(forecastsByDay.keys()).sort((a, b) => {
    // Sort by day of week order
    const dayOrder: Record<string, number> = {
      'dom': 0, 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sáb': 6
    };
    return (dayOrder[a.toLowerCase()] ?? 0) - (dayOrder[b.toLowerCase()] ?? 0);
  });
  
  const swellData = uniqueDays.map(day => {
    const dayData = forecastsByDay.get(day);
    return {
      day,
      height: dayData ? dayData.height.reduce((a, b) => a + b, 0) / dayData.height.length : 0,
      period: dayData ? dayData.period.reduce((a, b) => a + b, 0) / dayData.period.length : 0,
    };
  });

  const windData = uniqueDays.map(day => {
    const dayData = forecastsByDay.get(day);
    return {
      day,
      speed: dayData ? dayData.windSpeed.reduce((a, b) => a + b, 0) / dayData.windSpeed.length : 0,
    };
  });

  const surfabilityData = uniqueDays.map(day => {
    const dayData = forecastsByDay.get(day);
    return {
      day,
      score: dayData ? dayData.score.reduce((a, b) => a + b, 0) / dayData.score.length : 0,
    };
  });

  // Generate tide data (mock for now, as tide data might not be in forecast)
  const tideData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    height: 1.0 + Math.sin(i * 0.5) * 0.8,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner message="Carregando métricas..." className="bg-transparent p-0" />
      </div>
    );
  }

  if (error || forecasts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-500">Nenhuma métrica disponível</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Métricas Detalhadas</h2>
        <p className="text-sm text-gray-600">Previsão de 7 dias para análise completa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swell Height & Period */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
              <Waves className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Altura do Swell</h3>
              <p className="text-xs text-gray-500">Próximos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={swellData}>
              <defs>
                <linearGradient id="swellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                formatter={(value: number) => [`${value.toFixed(1)}m`, 'Altura']}
              />
              <Area 
                type="monotone" 
                dataKey="height" 
                stroke="#06B6D4" 
                strokeWidth={3}
                fill="url(#swellGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Wind Speed */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center">
              <Wind className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Velocidade do Vento</h3>
              <p className="text-xs text-gray-500">Próximos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={windData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                formatter={(value: number) => [`${value.toFixed(0)} km/h`, 'Vento']}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#14B8A6" 
                strokeWidth={3}
                dot={{ fill: '#14B8A6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Swell Period */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Período do Swell</h3>
              <p className="text-xs text-gray-500">Próximos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={swellData}>
              <defs>
                <linearGradient id="periodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                formatter={(value: number) => [`${value.toFixed(0)}s`, 'Período']}
              />
              <Area 
                type="monotone" 
                dataKey="period" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#periodGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Surfability Score */}
        <motion.div
          className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-sm text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white">Nota de Surfabilidade</h3>
              <p className="text-xs text-white/80">Próximos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={surfabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.8)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.8)" style={{ fontSize: '12px' }} domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#6366F1', 
                  border: 'none', 
                  borderRadius: '12px', 
                  color: 'white'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}`, 'Nota']}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#FFFFFF" 
                strokeWidth={3}
                dot={{ fill: '#FFFFFF', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { parseForecastRaw } from '@/lib/utils/forecast';
import { NoDataMessage } from './NoDataMessage';

export function WaveVisualization() {
  const [showLabels, setShowLabels] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  
  const { data } = useSpotWithForecastQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });

  const latestForecast = data?.spot?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  if (!selectedSpot) {
    return (
      <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 text-white text-center">
        <p>Selecione um pico para ver a visualização da onda</p>
      </div>
    );
  }

  // Show simple message if no forecast data (form is shown at page level)
  if (!parsed || !latestForecast) {
    return (
      <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 text-white text-center">
        <NoDataMessage message="Visualização não disponível" />
      </div>
    );
  }

  // Wave properties from forecast
  const waveHeight = parsed.swellHeight || parsed.waveHeight;
  const period = parsed.swellPeriod || parsed.wavePeriod;

  if (!waveHeight || !period) {
    return (
      <NoForecastData spotName={selectedSpot.name} spotId={selectedSpot.id} />
    );
  }

  // Determine wave quality based on period and height
  const waveQuality =
    period >= 12 && waveHeight >= 1.0
      ? 'hollow'
      : period >= 10
        ? 'peaky'
        : 'mushy';

  // Scale for visualization (1m = 60px)
  const scale = 60;
  const visualHeight = waveHeight * scale;

  return (
    <div
      className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 relative overflow-hidden cursor-pointer"
      onClick={() => setShowLabels(!showLabels)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Sky background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white mb-1">Visualização da Onda</h3>
            <p className="text-sm text-white/80">Condições ao vivo</p>
          </div>
          <div className="text-right">
            <div className="text-2xl text-white">{waveHeight}m</div>
            <div className="text-xs text-white/80">período {period}s</div>
          </div>
        </div>

        {/* Wave Visualization */}
        <div className="relative h-48 bg-gradient-to-b from-transparent via-blue-600/10 to-blue-900/30 rounded-xl overflow-hidden">
          {/* Horizon line */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-white/20 border-dashed"></div>

          {/* Surfer silhouette for scale - improved animation */}
          <motion.div
            className="absolute"
            style={{
              left: '15%',
              bottom: `${visualHeight + 20}px`,
            }}
            animate={{
              y: [0, -12, -8, -12, 0],
              rotate: [0, -8, -3, -8, 0],
              scale: isHovering ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: period / 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className="text-4xl filter drop-shadow-lg"
              animate={{ rotate: isHovering ? [0, 5, -5, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              🏄
            </motion.div>
          </motion.div>

          {/* Additional surfer */}
          <motion.div
            className="absolute"
            style={{
              left: '60%',
              bottom: `${visualHeight * 0.6}px`,
            }}
            animate={{
              y: [0, -10, -5, -10, 0],
              rotate: [0, 10, 5, 10, 0],
              x: [-10, 10, -10],
            }}
            transition={{
              duration: period / 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <div className="text-3xl filter drop-shadow-lg">🏄‍♀️</div>
          </motion.div>

          {/* Animated Wave */}
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
          >
            {/* Wave body */}
            <motion.path
              d={`M 0,180 
                  Q 100,${180 - visualHeight * 0.3} 200,${180 - visualHeight * 0.6}
                  Q 300,${180 - visualHeight * 0.9} 400,${180 - visualHeight}
                  Q 500,${180 - visualHeight * 0.8} 600,${180 - visualHeight * 0.4}
                  Q 700,${180 - visualHeight * 0.1} 800,180
                  L 800,200 L 0,200 Z`}
              fill="url(#wave-body-gradient)"
              animate={{
                d: [
                  `M 0,180 
                   Q 100,${180 - visualHeight * 0.3} 200,${180 - visualHeight * 0.6}
                   Q 300,${180 - visualHeight * 0.9} 400,${180 - visualHeight}
                   Q 500,${180 - visualHeight * 0.8} 600,${180 - visualHeight * 0.4}
                   Q 700,${180 - visualHeight * 0.1} 800,180
                   L 800,200 L 0,200 Z`,
                  `M 0,180 
                   Q 100,${180 - visualHeight * 0.4} 200,${180 - visualHeight * 0.7}
                   Q 300,${180 - visualHeight * 1.0} 400,${180 - visualHeight * 0.95}
                   Q 500,${180 - visualHeight * 0.75} 600,${180 - visualHeight * 0.35}
                   Q 700,${180 - visualHeight * 0.15} 800,180
                   L 800,200 L 0,200 Z`,
                  `M 0,180 
                   Q 100,${180 - visualHeight * 0.3} 200,${180 - visualHeight * 0.6}
                   Q 300,${180 - visualHeight * 0.9} 400,${180 - visualHeight}
                   Q 500,${180 - visualHeight * 0.8} 600,${180 - visualHeight * 0.4}
                   Q 700,${180 - visualHeight * 0.1} 800,180
                   L 800,200 L 0,200 Z`,
                ],
              }}
              transition={{
                duration: period / 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Wave lip/curl for hollow waves */}
            {waveQuality === 'hollow' && (
              <motion.path
                d={`M 350,${180 - visualHeight * 0.95} 
                    Q 380,${180 - visualHeight * 1.1} 420,${180 - visualHeight * 0.9}
                    Q 450,${180 - visualHeight * 0.7} 470,${180 - visualHeight * 0.5}
                    L 450,${180 - visualHeight * 0.6}
                    Q 430,${180 - visualHeight * 0.8} 400,${180 - visualHeight * 0.95}
                    Z`}
                fill="url(#wave-curl-gradient)"
                animate={{
                  d: [
                    `M 350,${180 - visualHeight * 0.95} 
                     Q 380,${180 - visualHeight * 1.1} 420,${180 - visualHeight * 0.9}
                     Q 450,${180 - visualHeight * 0.7} 470,${180 - visualHeight * 0.5}
                     L 450,${180 - visualHeight * 0.6}
                     Q 430,${180 - visualHeight * 0.8} 400,${180 - visualHeight * 0.95}
                     Z`,
                    `M 360,${180 - visualHeight * 1.0} 
                     Q 390,${180 - visualHeight * 1.15} 430,${180 - visualHeight * 0.95}
                     Q 460,${180 - visualHeight * 0.75} 480,${180 - visualHeight * 0.55}
                     L 460,${180 - visualHeight * 0.65}
                     Q 440,${180 - visualHeight * 0.85} 410,${180 - visualHeight * 1.0}
                     Z`,
                    `M 350,${180 - visualHeight * 0.95} 
                     Q 380,${180 - visualHeight * 1.1} 420,${180 - visualHeight * 0.9}
                     Q 450,${180 - visualHeight * 0.7} 470,${180 - visualHeight * 0.5}
                     L 450,${180 - visualHeight * 0.6}
                     Q 430,${180 - visualHeight * 0.8} 400,${180 - visualHeight * 0.95}
                     Z`,
                  ],
                }}
                transition={{
                  duration: period / 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* White water/foam - improved */}
            <motion.path
              d={`M 400,${180 - visualHeight * 0.98} 
                  Q 450,${180 - visualHeight * 0.85} 500,${180 - visualHeight * 0.65}
                  Q 550,${180 - visualHeight * 0.4} 600,${180 - visualHeight * 0.2}
                  L 600,${180 - visualHeight * 0.15}
                  Q 550,${180 - visualHeight * 0.35} 500,${180 - visualHeight * 0.6}
                  Q 450,${180 - visualHeight * 0.8} 400,${180 - visualHeight * 0.93}
                  Z`}
              fill="rgba(255,255,255,0.7)"
              animate={{
                opacity: [0.4, 0.9, 0.4],
                x: [0, 30, 0],
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Additional foam particles */}
            {[...Array(5)].map((_, i) => (
              <motion.circle
                key={i}
                cx={450 + i * 30}
                cy={180 - visualHeight * (0.8 - i * 0.1)}
                r="3"
                fill="rgba(255,255,255,0.8)"
                animate={{
                  cy: [
                    180 - visualHeight * (0.8 - i * 0.1),
                    180 - visualHeight * (0.7 - i * 0.1),
                    180 - visualHeight * (0.8 - i * 0.1),
                  ],
                  opacity: [0.8, 0.3, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}

            <defs>
              <linearGradient
                id="wave-body-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="1" />
              </linearGradient>
              <linearGradient
                id="wave-curl-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels */}
          {showLabels && (
            <>
              {/* Height indicator */}
              <motion.div
                className="absolute left-4"
                style={{ top: `${180 - visualHeight - 20}px` }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                  <div className="text-xs text-gray-600">Parede da Onda:</div>
                  <div className="text-sm text-cyan-600">
                    ~{(waveHeight * 1.5).toFixed(1)}m
                  </div>
                </div>
              </motion.div>

              {/* Wave shape label */}
              <motion.div
                className="absolute right-4 top-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                  <div className="text-xs text-gray-500">Formato</div>
                  <div className="text-sm text-gray-900">
                    {waveQuality === 'hollow'
                      ? 'Cavada'
                      : waveQuality === 'peaky'
                        ? 'Pico'
                        : 'Suave'}
                  </div>
                </div>
              </motion.div>

              {/* Power indicator */}
              <motion.div
                className="absolute bottom-4 right-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg px-3 py-1.5 shadow-lg text-sm">
                  {period >= 12
                    ? '💪 Potente'
                    : period >= 10
                      ? '⚡ Moderada'
                      : '🌊 Suave'}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Info bar */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="text-white/90">
              <span className="text-white/60">Altura:</span>{' '}
              {waveHeight.toFixed(1)}m
            </div>
            <div className="text-white/90">
              <span className="text-white/60">Período:</span> {period}s
            </div>
          </div>
          <div className="text-xs text-white/60">
            Clique para {showLabels ? 'ocultar' : 'mostrar'} rótulos
          </div>
        </div>
      </div>
    </div>
  );
}

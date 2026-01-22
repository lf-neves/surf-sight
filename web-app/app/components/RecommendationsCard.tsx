'use client';

import { motion } from 'motion/react';
import { Sparkles, User, Wind } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotWithForecastQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  windSpeedToKmh,
  degreesToDirection,
} from '@/lib/utils/forecast';

export function RecommendationsCard() {
  const [activeTab, setActiveTab] = useState<'board' | 'wetsuit' | 'skill'>(
    'board'
  );
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  
  const { data } = useSpotWithForecastQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });

  const latestForecast = data?.spot?.latestForecastForSpot;
  const parsed = latestForecast ? parseForecastRaw(latestForecast.raw) : null;

  const recommendations = useMemo(() => {
    if (!parsed) {
      return {
        board: {
          icon: '🏄',
          title: 'Carregando...',
          description: 'Aguardando dados do pico',
          details: [],
          color: 'from-cyan-500 to-blue-500',
        },
        wetsuit: {
          icon: '🩳',
          title: 'Carregando...',
          description: 'Aguardando dados do pico',
          details: [],
          color: 'from-teal-500 to-cyan-500',
        },
        skill: {
          icon: '⭐',
          title: 'Carregando...',
          description: 'Aguardando dados do pico',
          details: [],
          color: 'from-blue-500 to-indigo-500',
        },
      };
    }

    const waveHeight = parsed.swellHeight || parsed.waveHeight || 0;
    const period = parsed.swellPeriod || parsed.wavePeriod || 0;
    const windSpeed = windSpeedToKmh(parsed.windSpeed);
    const waterTemp = parsed.waterTemperature || 20;

    // Board recommendation based on wave size and period
    let boardTitle = 'Shortboard (5\'10" - 6\'2")';
    let boardDescription = 'Perfeita para essas ondas';
    let boardDetails: string[] = [];

    if (waveHeight < 0.8) {
      boardTitle = "Longboard (9'+) ou Funboard";
      boardDescription = 'Ondas pequenas - melhor para longboard';
      boardDetails = [
        'Altura baixa favorece longboard',
        'Período curto = ondas mais suaves',
        'Ideal para iniciantes e intermediários',
      ];
    } else if (waveHeight >= 0.8 && waveHeight < 1.5 && period >= 10) {
      boardTitle = 'Shortboard (5\'10" - 6\'2")';
      boardDescription = 'Perfeita para essas ondas cavadas e potentes';
      boardDetails = [
        `Período de ${period}s significa potência organizada`,
        `Vento ${windSpeed < 10 ? 'offshore' : 'moderado'} = ${windSpeed < 10 ? 'manobras radicais' : 'condições estáveis'}`,
        `Altura de ${waveHeight.toFixed(1)}m é ideal para performance`,
      ];
    } else if (waveHeight >= 1.5) {
      boardTitle = 'Gun ou Step-up (6\'6" - 7\'6")';
      boardDescription = 'Ondas grandes exigem prancha maior';
      boardDetails = [
        `Altura de ${waveHeight.toFixed(1)}m requer mais volume`,
        `Período de ${period}s = ondas poderosas`,
        'Ideal para surfistas experientes',
      ];
    }

    // Wetsuit recommendation based on water temperature
    let wetsuitTitle = 'Apenas Sunga';
    let wetsuitDescription = `Água a ${Math.round(waterTemp)}°C`;
    let wetsuitDetails: string[] = [];

    if (waterTemp >= 24) {
      wetsuitTitle = 'Apenas Sunga';
      wetsuitDescription = `Água a ${Math.round(waterTemp)}°C - condições tropicais`;
      wetsuitDetails = [
        'Água quentinha para sessões o dia todo',
        'Sem necessidade de roupa de borracha',
        'Lycra opcional para proteção solar',
      ];
    } else if (waterTemp >= 20) {
      wetsuitTitle = 'Spring Suit (1mm)';
      wetsuitDescription = `Água a ${Math.round(waterTemp)}°C - temperatura agradável`;
      wetsuitDetails = [
        'Temperatura confortável',
        'Spring suit opcional para sessões longas',
        'Sunga também funciona',
      ];
    } else if (waterTemp >= 18) {
      wetsuitTitle = 'Wetsuit 2/2mm';
      wetsuitDescription = `Água a ${Math.round(waterTemp)}°C - um pouco fria`;
      wetsuitDetails = [
        'Recomendado wetsuit fino',
        '2/2mm suficiente para conforto',
        'Sessões longas podem esfriar',
      ];
    } else {
      wetsuitTitle = 'Wetsuit 3/2mm ou 4/3mm';
      wetsuitDescription = `Água a ${Math.round(waterTemp)}°C - fria`;
      wetsuitDetails = [
        'Água fria - wetsuit necessário',
        '3/2mm para temperaturas acima de 15°C',
        '4/3mm para temperaturas abaixo de 15°C',
      ];
    }

    // Skill level recommendation
    let skillTitle = 'Intermediário';
    let skillDescription = 'Essas condições são acessíveis';
    let skillDetails: string[] = [];

    const isAdvanced = waveHeight >= 1.5 || (waveHeight >= 1.2 && period >= 12);
    const isBeginner = waveHeight < 0.8 && period < 8;

    if (isAdvanced) {
      skillTitle = 'Avançado';
      skillDescription = 'Essas condições recompensam a experiência';
      skillDetails = [
        'Ondas potentes exigem remada forte',
        'Período longo = ondas organizadas mas poderosas',
        'Recomendado para surfistas experientes',
      ];
    } else if (isBeginner) {
      skillTitle = 'Iniciante a Intermediário';
      skillDescription = 'Condições ideais para aprender';
      skillDetails = [
        'Ondas menores e mais suaves',
        'Perfeito para praticar técnicas',
        'Seguro para iniciantes',
      ];
    } else {
      skillTitle = 'Intermediário a Avançado';
      skillDescription = 'Condições boas para todos os níveis';
      skillDetails = [
        `Ondas de ${waveHeight.toFixed(1)}m são versáteis`,
        `Período de ${period}s oferece boa organização`,
        'Ideal para surfistas com alguma experiência',
      ];
    }

    return {
      board: {
        icon: '🏄',
        title: boardTitle,
        description: boardDescription,
        details: boardDetails,
        color: 'from-cyan-500 to-blue-500',
      },
      wetsuit: {
        icon: '🩳',
        title: wetsuitTitle,
        description: wetsuitDescription,
        details: wetsuitDetails,
        color: 'from-teal-500 to-cyan-500',
      },
      skill: {
        icon: '⭐',
        title: skillTitle,
        description: skillDescription,
        details: skillDetails,
        color: 'from-blue-500 to-indigo-500',
      },
    };
  }, [parsed]);

  const currentRec = recommendations[activeTab];

  if (!selectedSpot) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <p>Selecione um pico para ver recomendações</p>
      </div>
    );
  }

  if (!parsed || !latestForecast) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
        <p className="text-white/90">Recomendações não disponíveis</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
            style={{
              left: `${i * 30}%`,
              top: `${i * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-white">Recomendações de Surf</h2>
            <p className="text-sm text-white/80">Prepare-se e caia dentro</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['board', 'wetsuit', 'skill'] as const).map((tab) => {
            const labels = {
              board: 'Prancha',
              wetsuit: 'Roupa',
              skill: 'Nível',
            };
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {labels[tab]}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <motion.div
                className="text-4xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentRec.icon}
              </motion.div>
              <div className="flex-1">
                <h3 className="text-white mb-1">{currentRec.title}</h3>
                <p className="text-sm text-white/80">
                  {currentRec.description}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {currentRec.details.map((detail, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/90"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                  <span>{detail}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          className="w-full mt-6 bg-white text-indigo-600 py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center justify-center gap-2">
            <span>🌊</span>
            <span>Perfeito! Bora Surfar</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

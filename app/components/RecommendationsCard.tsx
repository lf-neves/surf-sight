'use client';

import { motion } from 'motion/react';
import { Sparkles, User, Wind } from 'lucide-react';
import { useState } from 'react';

export function RecommendationsCard() {
  const [activeTab, setActiveTab] = useState<'board' | 'wetsuit' | 'skill'>('board');

  const recommendations = {
    board: {
      icon: '🏄',
      title: 'Shortboard (5\'10" - 6\'2")',
      description: 'Perfeita para essas ondas cavadas e potentes',
      details: [
        'Período de 12s significa potência organizada',
        'Vento offshore limpo = manobras radicais',
        'Altura de 1.3m é ideal para performance'
      ],
      color: 'from-cyan-500 to-blue-500'
    },
    wetsuit: {
      icon: '🩳',
      title: 'Apenas Sunga',
      description: 'Água a 24°C - condições tropicais do Rio',
      details: [
        'Água quentinha para sessões o dia todo',
        'Sem necessidade de roupa de borracha',
        'Lycra opcional para proteção solar'
      ],
      color: 'from-teal-500 to-cyan-500'
    },
    skill: {
      icon: '⭐',
      title: 'Intermediário a Avançado',
      description: 'Essas condições recompensam a experiência',
      details: [
        'Ondas potentes exigem remada forte',
        'Vento offshore requer bom posicionamento',
        'Maré média cria seções rápidas'
      ],
      color: 'from-blue-500 to-indigo-500'
    }
  };

  const currentRec = recommendations[activeTab];

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
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2
            }}
            style={{
              left: `${i * 30}%`,
              top: `${i * 20}%`
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
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
            const labels = { board: 'Prancha', wetsuit: 'Roupa', skill: 'Nível' };
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
                <p className="text-sm text-white/80">{currentRec.description}</p>
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

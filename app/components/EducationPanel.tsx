'use client';

import { motion } from 'motion/react';
import { Lightbulb, Wind, Waves, Clock } from 'lucide-react';

export function EducationPanel() {
  const insights = [
    {
      icon: Waves,
      title: 'O que esse swell significa',
      description: 'O swell de 1.3m com período de 12s vindo de ESE é ideal para este pico. Período maior significa ondas mais potentes e organizadas.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Wind,
      title: 'Como o vento afeta hoje',
      description: 'Vento offshore de oeste a 12 km/h vai pentear as ondas, criando paredes limpas perfeitas para manobras radicais.',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Melhor janela de maré',
      description: 'Surf ideal é 2 horas antes e depois da maré alta (7h - 11h). Maré média enchendo oferece o melhor formato de onda aqui.',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-gray-900">Aprenda a Ler o Mar</h2>
          <p className="text-sm text-gray-600">Entendendo as condições de hoje</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${insight.color} rounded-lg flex items-center justify-center mb-4`}>
              <insight.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-900 mb-2">{insight.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {insight.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Dica de Mestre:</strong> No Arpoador, entre perto das pedras do lado direito da praia. 
              O swell de ESE encaixa perfeitamente na Pedra do Arpoador, criando as clássicas direitas cavadas. 
              Atenção com o crowd - essa é a onda mais famosa do Rio!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

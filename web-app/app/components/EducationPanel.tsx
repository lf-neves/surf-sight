'use client';

import { motion } from 'motion/react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';
import { useSpotAiInsightsQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { Section } from '@/components/ui/section';
import { CardContent } from '@/components/ui/card-content';

export function EducationPanel() {
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  
  const { data } = useSpotAiInsightsQuery({
    variables: { id: selectedSpot?.id || '' },
    skip: !selectedSpot?.id,
  });

  const aiInsights = data?.spot?.aiInsights;

  if (!selectedSpot) {
    return (
      <Section variant="gradient" className="text-center">
        <p className="text-gray-600">
          Selecione um pico para ver insights educativos
        </p>
      </Section>
    );
  }

  if (!aiInsights) {
    return (
      <Section variant="gradient" className="text-center">
        <p className="text-gray-600">
          Insights de IA ainda não disponíveis para este pico
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Os insights são gerados automaticamente quando há previsões
          disponíveis
        </p>
      </Section>
    );
  }

  // Map skill level to Portuguese
  const skillLevelMap: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    expert: 'Expert',
  };

  const skillLevelPt = aiInsights.skillLevel
    ? skillLevelMap[aiInsights.skillLevel.toLowerCase()] ||
      aiInsights.skillLevel
    : 'Intermediário';

  return (
    <Section variant="gradient">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">Análise de IA</h2>
            <p className="text-sm text-gray-600">
              Insights inteligentes sobre as condições
            </p>
          </div>
        </div>
        {typeof aiInsights.rating === 'number' && aiInsights.rating > 0 && (
          <CardContent variant="glass" className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-semibold text-gray-900">
                {aiInsights.rating}/10
              </span>
            </div>
          </CardContent>
        )}
      </div>

      {/* Conditions Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <CardContent variant="glass" padding="lg">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold mb-2">
                Condições Atuais
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiInsights.conditions}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Nível recomendado:</span>
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium">
                {skillLevelPt}
              </span>
            </div>
          </div>
        </CardContent>
      </motion.div>

      {/* Recommendations */}
      {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <CardContent variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold">Recomendações</h3>
            </div>
            <ul className="space-y-2">
              {aiInsights.recommendations
                .filter((r): r is string => !!r)
                .map((recommendation, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{recommendation}</span>
                  </motion.li>
                ))}
            </ul>
          </CardContent>
        </motion.div>
      )}

      {/* Risks */}
      {aiInsights.risks && aiInsights.risks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardContent variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold">Atenção</h3>
            </div>
            <ul className="space-y-2">
              {aiInsights.risks
                .filter((r): r is string => !!r)
                .map((risk, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{risk}</span>
                  </motion.li>
                ))}
            </ul>
          </CardContent>
        </motion.div>
      )}
    </Section>
  );
}

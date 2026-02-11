'use client';

import { Droplets, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { useAppSelector } from '@/lib/store/hooks';
import { useTidesForSpotQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card-header';
import { CardContent } from '@/components/ui/card-content';
import { NoDataMessage } from './NoDataMessage';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatTideTime(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return format(d, 'HH:mm', { locale: ptBR });
  if (isTomorrow(d)) return format(d, "'Amanhã' HH:mm", { locale: ptBR });
  return format(d, "dd/MM HH:mm", { locale: ptBR });
}

function formatTideType(type: string | null | undefined): string {
  if (!type) return 'Maré';
  const t = type.toLowerCase();
  if (t === 'high') return 'Alta';
  if (t === 'low') return 'Baixa';
  return type;
}

export function TideCard() {
  const selectedSpot = useAppSelector((state) => state.spot.selectedSpot);
  const { data, loading, error } = useTidesForSpotQuery({
    variables: { spotId: selectedSpot?.id ?? '' },
    skip: !selectedSpot?.id,
  });

  if (!selectedSpot) {
    return null;
  }

  const result = data?.tidesForSpot;
  const points = result?.points ?? [];
  const hasPoints = points.length > 0;

  return (
    <Card>
      <CardHeader icon={Droplets} title="Maré" iconGradient="from-blue-100 to-cyan-100" />
      {loading && (
        <CardContent>
          <p className="text-sm text-gray-500">Carregando marés...</p>
        </CardContent>
      )}
      {error && (
        <CardContent>
          <p className="text-sm text-amber-600">Não foi possível carregar as marés. Tente novamente.</p>
        </CardContent>
      )}
      {!loading && !error && !hasPoints && (
        <NoDataMessage
          message="Dados de maré não disponíveis para este pico. Configure STORMGLASS_API_KEY para ativar."
          noForecast
        />
      )}
      {!loading && !error && hasPoints && (
        <CardContent variant="glass" className="space-y-3">
          {result?.stationName && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Estação: {result.stationName}
            </p>
          )}
          <ul className="space-y-2">
            {points.slice(0, 8).map((point, i) => {
              if (!point) return null;
              return (
                <li
                  key={`${point.time}-${i}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    {point.type === 'high' ? (
                      <ArrowUp className="w-4 h-4 text-cyan-600" aria-hidden />
                    ) : point.type === 'low' ? (
                      <ArrowDown className="w-4 h-4 text-blue-600" aria-hidden />
                    ) : null}
                    {formatTideType(point.type ?? null)}
                  </span>
                  <span className="text-gray-500 tabular-nums">{formatTideTime(point.time ?? '')}</span>
                  <span className="font-medium text-gray-900 tabular-nums">{(point.height ?? 0).toFixed(1)} m</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}

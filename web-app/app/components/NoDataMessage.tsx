'use client';

interface NoDataMessageProps {
  message?: string;
  /** When true, shows a friendly message for "spot selected but no forecast data yet" */
  noForecast?: boolean;
  className?: string;
}

const NO_FORECAST_MESSAGE =
  'Nenhuma previsão disponível para este pico ainda. Os dados aparecerão quando houver previsão.';

export function NoDataMessage({
  message = 'Dados não disponíveis',
  noForecast = false,
  className = '',
}: NoDataMessageProps) {
  const text = noForecast ? NO_FORECAST_MESSAGE : message;
  return (
    <div className={`bg-gray-50 rounded-xl p-4 text-center ${className}`}>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

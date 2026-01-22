'use client';

interface NoDataMessageProps {
  message?: string;
  className?: string;
}

export function NoDataMessage({ 
  message = 'Dados não disponíveis',
  className = ''
}: NoDataMessageProps) {
  return (
    <div className={`bg-gray-50 rounded-xl p-4 text-center ${className}`}>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

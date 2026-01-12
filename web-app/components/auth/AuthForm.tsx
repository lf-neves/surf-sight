import { ReactNode } from 'react';
import { Form } from '@/components/forms';
import { ErrorMessage } from './ErrorMessage';
import { FieldValues } from 'react-hook-form';

interface AuthFormProps<T extends FieldValues> {
  title: string;
  subtitle: string;
  onSubmit: (data: T) => void | Promise<void>;
  error?: string | null;
  children: ReactNode;
  footer?: ReactNode;
  defaultValues?: Partial<T>;
}

export function AuthForm<T extends FieldValues>({
  title,
  subtitle,
  onSubmit,
  error,
  children,
  footer,
  defaultValues,
}: AuthFormProps<T>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          <Form onSubmit={onSubmit} defaultValues={defaultValues} className="space-y-4">
            {error && <ErrorMessage message={error} />}

            {children}
          </Form>

          {footer && <div className="text-center text-sm text-gray-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

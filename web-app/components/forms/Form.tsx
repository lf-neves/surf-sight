'use client';

import { ReactNode } from 'react';
import { useForm, FormProvider, UseFormProps, FieldValues } from 'react-hook-form';

interface FormProps<T extends FieldValues> extends UseFormProps<T> {
  children: ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  className?: string;
}

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  className,
  ...formProps
}: FormProps<T>) {
  const methods = useForm<T>(formProps);

  const handleSubmit = methods.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

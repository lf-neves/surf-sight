'use client';

import { useFormContext, RegisterOptions } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';

interface TextFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  helperText?: ReactNode;
  rules?: RegisterOptions;
}

export function TextField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  minLength,
  helperText,
  rules,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const fieldRules: RegisterOptions = {
    required: required ? `${label} is required` : false,
    minLength: minLength
      ? {
          value: minLength,
          message: `${label} must be at least ${minLength} characters`,
        }
      : undefined,
    ...rules,
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...register(name, fieldRules)}
      />
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

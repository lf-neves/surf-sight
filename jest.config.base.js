import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const libsBasePath = resolve(__dirname, 'libs');

export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const roots = ['<rootDir>/src'];
export const testMatch = ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'];
export const transform = {
  '^.+\\.ts$': [
    'ts-jest',
    {
      useESM: false,
    },
  ],
  '^.+\\.js$': [
    'ts-jest',
    {
      useESM: false,
    },
  ],
};
export const collectCoverageFrom = [
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/**/__tests__/**',
  '!src/**/__mocks__/**',
];
export const moduleNameMapper = {
  // Map packages with src folder (like database, test-setup)
  '^@surf-sight/(database|test-setup)$': `${libsBasePath}/$1/src`,
  // Map packages without src folder (like core)
  '^@surf-sight/(core)$': `${libsBasePath}/$1`,
  // Fallback for any other @surf-sight packages
  '^@surf-sight/(.*)$': `${libsBasePath}/$1/src`,
};
export const setupFilesAfterEnv = [resolve(__dirname, 'jest.setup.ts')];
export const transformIgnorePatterns = [
  'node_modules/(?!.*(p-map|uuid))',
];
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const coveragePathIgnorePatterns = [
  '/node_modules/',
  '/dist/',
  '/__tests__/',
];

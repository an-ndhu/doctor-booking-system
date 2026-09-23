import type { Config } from 'jest';

const tsJestProject = {
  preset: 'ts-jest',
  testEnvironment: 'node' as const,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
};

const config: Config = {
  testTimeout: 30000,
  projects: [
    {
      ...tsJestProject,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/scheduling/slots.test.ts', '<rootDir>/tests/health.test.ts'],
      setupFiles: ['<rootDir>/tests/setup-env.ts'],
    },
    {
      ...tsJestProject,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
      testPathIgnorePatterns: ['slots.test.ts', 'health.test.ts'],
      setupFiles: ['<rootDir>/tests/setup-env.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    },
  ],
};

export default config;

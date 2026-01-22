import { pgEnum } from 'drizzle-orm/pg-core';

export const userSkillLevelEnum = pgEnum('user_skill_level', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const spotTypeEnum = pgEnum('spot_type', ['beach', 'reef', 'point', 'other']);

export const jobStatusEnum = pgEnum('job_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

// Export enum types for TypeScript
export type UserSkillLevel = typeof userSkillLevelEnum.enumValues[number];
export type SpotType = typeof spotTypeEnum.enumValues[number];
export type JobStatus = typeof jobStatusEnum.enumValues[number];

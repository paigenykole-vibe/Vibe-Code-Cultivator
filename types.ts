
import React from 'react';

export enum ModuleType {
  CREATIVITY = 'creativity',
  PROMPTING = 'prompting',
  CODE_ONRAMP = 'code_onramp'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ModuleData {
  id: ModuleType;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  lessons: string[];
  intro: string;
}

export interface UserStats {
  points: number;
  bucketXP: Record<ModuleType, number>;
  completedModules: ModuleType[];
  currentModule: ModuleType | null;
  level: number;
  allBucketsComplete?: boolean;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}
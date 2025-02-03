import { FormStepField } from './form-steps';

export interface FormData {
  id: string;
  title: string;
  description?: string;
  fields: FormStepField[];
  createdAt: Date;
  updatedAt: Date;
  template: 'Clásico' | 'Minimalista' | 'Llamativo';
  url: string;
  isActive: boolean;
  color?: string;
} 
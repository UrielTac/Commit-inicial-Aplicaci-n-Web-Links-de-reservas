import { FormStepField } from "@/types/form-steps";

export interface PublishedFormAnalytics {
  views: number;
  submissions: number;
  lastSubmission?: Date;
  lastView?: Date;
}

export interface PublishedFormSettings {
  theme: 'light' | 'dark';
  isCustomizable?: boolean;
}

export interface PublishedForm {
  id: string;
  slug: string;
  title: string;
  description?: string;
  fields: FormStepField[];
  settings: PublishedFormSettings;
  status: 'draft' | 'published' | 'archived';
  analytics: PublishedFormAnalytics;
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface FormUrlConfig {
  formId: string;
  slug: string;
  customDomain?: string;
  isCustomizable?: boolean;
} 
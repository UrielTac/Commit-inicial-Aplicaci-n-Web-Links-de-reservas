import { FormStepField } from "@/types/form-steps";

export interface PublishedFormAnalytics {
  views?: number;
  submissions?: number;
  lastSubmission?: Date;
  lastView?: Date;
}

export interface PublishedFormSettings {
  theme: 'light' | 'dark';
  isCustomizable?: boolean;
}

export interface FormPublishConfig {
  title: string;
  description?: string;
  theme?: 'light' | 'dark';
  settings?: {
    slug?: string;
  };
  userId?: string;
  organizationId?: string;
  customization?: {
    colors?: {
      primary?: string;
      secondary?: string;
    };
    logo?: {
      url?: string;
      position?: 'left' | 'center' | 'right';
    };
  };
}

export interface PublishedForm {
  id: string;
  slug: string;
  title: string;
  description?: string;
  fields: FormStepField[];
  settings: {
    theme?: 'light' | 'dark';
    isCustomizable?: boolean;
  };
  customization?: {
    colors?: {
      primary?: string;
    };
    logo?: {
      url?: string;
    };
  };
  status: 'published' | 'draft' | 'archived';
  analytics?: PublishedFormAnalytics;
  metadata?: {
    createdBy?: string;
    updatedBy?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
}

export interface FormUrlConfig {
  formId: string;
  slug: string;
  customDomain?: string;
  isCustomizable?: boolean;
} 
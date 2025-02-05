'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useContext } from 'react';
import { OrganizationContext } from '@/contexts/OrganizationContext';
import { formPublishService } from '@/lib/services/forms/publish-service';
import { toast } from 'sonner';

interface FormPublishConfig {
  title: string;
  description?: string;
  fields: any[];
  theme?: 'light' | 'dark';
  customization?: {
    colors?: {
      primary?: string;
    };
    logo?: {
      url?: string;
    };
  };
}

export function useFormPublishing() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error('useFormPublishing debe usarse dentro de OrganizationProvider');
  }

  const { organizationId, isLoading, error: orgError } = context;

  const handleError = (err: unknown): Error => {
    const error = err instanceof Error ? err : new Error('Error desconocido al publicar el formulario');
    setError(error);
    toast.error(error.message);
    return error;
  };

  const publishForm = async (config: FormPublishConfig): Promise<string> => {
    setIsPublishing(true);
    setError(null);

    try {
      if (isLoading) {
        throw new Error('Cargando información de la organización...');
      }

      if (orgError) {
        throw new Error(`Error de organización: ${orgError}`);
      }

      if (!organizationId) {
        throw new Error('No se encontró la organización. Por favor, verifica que estés conectado correctamente.');
      }

      console.log('📝 Iniciando publicación del formulario:', {
        ...config,
        organizationId
      });

      // Publicar el formulario incluyendo el empresa_id
      const url = await formPublishService.publish({
        ...config,
        empresa_id: organizationId
      });

      console.log('✅ Formulario publicado:', { url });
      toast.success('Formulario publicado exitosamente');

      return url;
    } catch (error) {
      console.error('❌ Error al publicar:', error);
      throw handleError(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    error,
    publishForm
  };
} 
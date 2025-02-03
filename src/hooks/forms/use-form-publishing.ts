import { useState, useCallback } from 'react';
import { PublishedForm } from '@/types/forms/publish';
import FormPublishService from '@/lib/services/forms/publish-service';
import { toast } from 'sonner';

interface UseFormPublishingReturn {
  publishForm: (form: Omit<PublishedForm, 'id' | 'slug'>) => Promise<string>;
  isPublishing: boolean;
  error: string | null;
  publishedUrl: string | null;
  clearError: () => void;
}

const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useFormPublishing] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[useFormPublishing Error] ${message}`, error || '');
    }
  }
};

export function useFormPublishing(): UseFormPublishingReturn {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const publishForm = useCallback(async (form: Omit<PublishedForm, 'id' | 'slug'>) => {
    debug.log('Starting form publication:', form);
    setIsPublishing(true);
    setError(null);
    
    try {
      const url = await FormPublishService.publish(form);
      debug.log('Form published successfully with URL:', url);
      
      setPublishedUrl(url);
      toast.success('¡Formulario publicado exitosamente!', {
        description: 'Ya puedes compartir el enlace con tus usuarios.'
      });
      
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al publicar el formulario';
      debug.error('Publication error:', err);
      
      setError(message);
      toast.error('Error al publicar el formulario', {
        description: message
      });
      
      throw err;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    debug.log('Clearing error state');
    setError(null);
  }, []);

  return {
    publishForm,
    isPublishing,
    error,
    publishedUrl,
    clearError
  };
} 
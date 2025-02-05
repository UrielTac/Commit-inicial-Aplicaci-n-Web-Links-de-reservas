'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BOOKING_FORM_TEMPLATE } from '@/lib/templates/booking-form-template';

interface FormConfig {
  empresaId: string | null;
  isLoading: boolean;
  error: Error | null;
  type: 'bookings' | 'classes' | null;
}

export function useFormConfig(slug: string | undefined) {
  const [config, setConfig] = useState<FormConfig>({
    empresaId: null,
    isLoading: true,
    error: null,
    type: null
  });

  useEffect(() => {
    const supabase = createClientComponentClient();
    let mounted = true;

    async function loadFormConfig() {
      try {
        if (!slug) {
          if (mounted) {
            setConfig(prev => ({
              ...prev,
              isLoading: false,
              error: new Error('Se requiere un slug válido')
            }));
          }
          return;
        }

        console.log('📍 Buscando configuración del formulario:', slug);

        // Solo necesitamos el ID de empresa y el tipo
        const { data: link, error: linkError } = await supabase
          .from('company_links')
          .select('empresa_id, type')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (linkError) {
          console.error('❌ Error al buscar formulario:', linkError);
          throw linkError;
        }

        if (!link) {
          console.error('❌ No se encontró el formulario:', slug);
          throw new Error('No se encontró el formulario especificado');
        }

        // Verificar que sea un link de reservas
        if (link.type !== 'bookings') {
          throw new Error('Este link no es para reservas');
        }

        console.log('✅ Link de reservas encontrado:', {
          slug,
          empresaId: link.empresa_id,
          type: link.type
        });

        if (mounted) {
          setConfig({
            empresaId: link.empresa_id,
            type: link.type,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('❌ Error al cargar configuración del formulario:', error);
        if (mounted) {
          setConfig(prev => ({
            ...prev,
            isLoading: false,
            error: error as Error,
            type: null
          }));
        }
      }
    }

    loadFormConfig();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return config;
} 
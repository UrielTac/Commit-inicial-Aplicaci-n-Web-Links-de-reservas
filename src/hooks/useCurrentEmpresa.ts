'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getSupabaseClient } from '@/lib/supabase-client';

interface EmpresaState {
  empresaId: string | null;
  isLoading: boolean;
  error: Error | null;
}

interface EmpresaData {
  id: string;
  auth_user_id: string;
}

export function useCurrentEmpresa() {
  const [state, setState] = useState<EmpresaState>({
    empresaId: null,
    isLoading: true,
    error: null
  });

  const { user, isLoading: isAuthLoading, error: authError } = useAuth();

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function fetchEmpresa() {
      try {
        // Si la autenticación está cargando, esperamos
        if (isAuthLoading) {
          setState(prev => ({ ...prev, isLoading: true }));
          return;
        }

        // Si hay un error de autenticación, lo propagamos
        if (authError) {
          setState({
            empresaId: null,
            isLoading: false,
            error: authError
          });
          return;
        }

        // Si no hay usuario, establecemos el error
        if (!user) {
          setState({
            empresaId: null,
            isLoading: false,
            error: new Error('Usuario no autenticado')
          });
          return;
        }

        // Buscar la empresa asociada al usuario
        const { data, error: empresaError } = await supabase
          .from('empresas')
          .select('id, auth_user_id')
          .eq('auth_user_id', user.id)
          .single();

        if (empresaError) {
          throw empresaError;
        }

        const empresa = data as EmpresaData;

        if (!empresa?.id) {
          throw new Error('No se encontró una empresa asociada al usuario');
        }

        setState({
          empresaId: empresa.id,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Error al obtener la empresa:', error);
        setState({
          empresaId: null,
          isLoading: false,
          error: error as Error
        });
      }
    }

    fetchEmpresa();
  }, [user, isAuthLoading, authError]);

  return state;
} 
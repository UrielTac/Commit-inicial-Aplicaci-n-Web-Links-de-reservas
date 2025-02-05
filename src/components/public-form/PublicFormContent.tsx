'use client';

import { useEffect, useState } from 'react';
import { PublishedForm } from '@/types/forms/publish';
import { FormPublishService } from '@/lib/services/forms/publish-service';
import { PublicFormLayout } from '@/components/public-form/layout/PublicFormLayout';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface PublicFormContentProps {
  slug: string;
  initialForm?: PublishedForm;
}

const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PublicFormContent] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[PublicFormContent Error] ${message}`, error || '');
    }
  }
};

export function PublicFormContent({ slug, initialForm }: PublicFormContentProps) {
  const [form, setForm] = useState<PublishedForm | null>(() => initialForm || null);
  const [loading, setLoading] = useState(!initialForm);
  const [error, setError] = useState<Error | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialForm?.fields) {
      return initialForm.fields.reduce((acc, field) => ({
        ...acc,
        [field.id]: null
      }), {});
    }
    return {};
  });

  useEffect(() => {
    const formService = new FormPublishService();

    async function loadForm() {
      try {
        debug.log('Cargando formulario con slug:', slug);
        const formData = await formService.getBySlug(slug);
        debug.log('Datos del formulario cargados:', formData);

        // Validar que el formulario tenga campos
        if (!formData.fields || formData.fields.length === 0) {
          throw new Error('El formulario no tiene campos definidos');
        }

        // Asegurar que empezamos desde el primer paso
        setCurrentStep(0);
        setForm(formData);
        setError(null);

        // Inicializar datos del formulario
        const initialData = formData.fields.reduce((acc, field) => ({
          ...acc,
          [field.id]: null
        }), {});
        setFormData(initialData);

        // Incrementar vistas
        await formService.incrementViews(slug);

      } catch (err) {
        debug.error('Error al cargar el formulario:', err);
        setError(err as Error);
        setForm(null);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [slug]);

  const handleNext = () => {
    if (!form?.fields) return;
    
    const nextStep = currentStep + 1;
    if (nextStep < form.fields.length) {
      debug.log(`Navegando al paso ${nextStep + 1}`);
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      debug.log(`Volviendo al paso ${currentStep}`);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepChange = (stepId: string, data: any) => {
    debug.log('Actualizando datos del paso:', { stepId, data });
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));
  };

  const handleExitClick = () => {
    if (Object.keys(formData).some(key => formData[key] !== null)) {
      setShowExitDialog(true);
    } else {
      setForm(null);
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    setForm(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            El formulario que buscas no está disponible
          </h1>
          <p className="text-gray-500">
            {error.message || 'Ha ocurrido un error al cargar el formulario'}
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Formulario no encontrado
          </h1>
          <p className="text-gray-500">
            El formulario que buscas no está disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <PublicFormLayout 
          form={form}
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onStepChange={handleStepChange}
          formData={formData}
          slug={slug}
        />
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas salir?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cambios que no hayas guardado se perderán. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-red-500 hover:bg-red-600"
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
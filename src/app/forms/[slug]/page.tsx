"use client"

import { useEffect, useState } from 'react';
import { PublishedForm } from '@/types/forms/publish';
import FormPublishService from '@/lib/services/forms/publish-service';
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
} from "@/components/ui/alert-dialog"

const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PublicForm] ${message}`, data || '');
    }
  }
};

export default function PublicFormPage({ params }: { params: { slug: string } }) {
  const [form, setForm] = useState<PublishedForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    async function loadForm() {
      debug.log('Loading form with slug:', params.slug);
      try {
        const formData = await FormPublishService.getBySlug(params.slug);
        debug.log('Form data loaded:', formData);
        
        if (!formData) {
          debug.log('Form not found');
          setError('Formulario no encontrado');
          return;
        }
        
        setForm(formData);
        
      } catch (err) {
        debug.log('Error loading form:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [params.slug]);

  const handleNext = () => {
    debug.log('Navegando al siguiente paso');
    if (form && currentStep < form.fields.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    debug.log('Navegando al paso anterior');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepChange = (stepId: string, data: any) => {
    debug.log('Cambio en paso:', { stepId, data });
  };

  const handleExitClick = () => {
    if (form && form.fields.length > 0 && !form.isPublished) {
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

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {error || 'Formulario no encontrado'}
          </h1>
          <p className="mt-2 text-gray-500">
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
        />
      </div>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas salir?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cambios que no hayas publicado se perderán. Esta acción no se puede deshacer.
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
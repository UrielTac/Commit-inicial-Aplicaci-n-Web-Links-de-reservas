import { PublicFormContent } from '@/components/public-form/PublicFormContent';
import { Metadata } from 'next';
import { FormPublishService } from '@/lib/services/forms/publish-service';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Función auxiliar para validar el slug
async function validateAndGetSlug(params: Props['params']): Promise<string> {
  if (!params?.slug || typeof params.slug !== 'string') {
    throw new Error('Se requiere un slug válido');
  }
  return params.slug;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const slug = await validateAndGetSlug(props.params);
    const formService = new FormPublishService();
    const form = await formService.getBySlug(slug);
    
    if (!form) {
      console.error('Formulario no encontrado para slug:', slug);
      return {
        title: 'Formulario no encontrado',
        description: 'El formulario que buscas no está disponible'
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const formUrl = `${baseUrl}/forms/${slug}`;

    return {
      title: form.title || 'Formulario de Reserva',
      description: form.description || 'Realiza tu reserva',
      openGraph: {
        title: form.title || 'Formulario de Reserva',
        description: form.description || 'Realiza tu reserva',
        type: 'website',
        url: formUrl,
      },
    };
  } catch (error) {
    console.error('Error al generar metadata:', error);
    return {
      title: 'Error',
      description: 'Ha ocurrido un error al cargar el formulario'
    };
  }
}

async function getFormData(slug: string): Promise<any> {
  try {
    const formService = new FormPublishService();
    const form = await formService.getBySlug(slug);

    if (!form) {
      console.error('Formulario no encontrado para slug:', slug);
      throw new Error('Formulario no encontrado');
    }

    return form;
  } catch (error) {
    console.error('Error al obtener datos del formulario:', error);
    throw error;
  }
}

export default async function PublicFormPage(props: Props) {
  try {
    const slug = await validateAndGetSlug(props.params);
    const formData = await getFormData(slug);

    return (
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                Cargando formulario...
              </h2>
              <p className="text-gray-500">
                Por favor, espera un momento
              </p>
            </div>
          </div>
        }
      >
        <div className="min-h-screen">
          <PublicFormContent 
            slug={slug} 
            initialForm={formData}
          />
        </div>
      </Suspense>
    );
  } catch (error) {
    console.error('Error en PublicFormPage:', error);
    return notFound();
  }
} 
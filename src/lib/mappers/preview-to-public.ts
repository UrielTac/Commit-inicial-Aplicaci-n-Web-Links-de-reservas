import { FormStepField } from '@/types/form-steps';
import * as PreviewComponents from '@/components/preview/steps';

// Actualizar el orden de los pasos
const STEP_ORDER = [
  'greeting',
  'users', 
  'location', 
  'shifts', 
  'items',
  'summary',
  'farewell'
];

// Actualizar el mapa de componentes
const componentMap: Record<string, any> = {
  'greeting': PreviewComponents.GreetingPreview,
  'farewell': PreviewComponents.FarewellPreview,
  'users': PreviewComponents.UsersPreview,
  'location': PreviewComponents.LocationPreview,
  'shifts': PreviewComponents.ShiftsPreview,
  'items': PreviewComponents.ItemsPreview,
  'summary': PreviewComponents.SummaryPreview,
};

// Función para ordenar los campos según el orden definido
export function sortFormFields(fields: FormStepField[]): FormStepField[] {
  const debug = {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FieldSorter] ${message}`, data || '');
      }
    }
  };

  debug.log('Ordenando campos:', { 
    originalOrder: fields.map(f => f.type),
    definedOrder: STEP_ORDER
  });

  const sortedFields = [...fields].sort((a, b) => {
    const indexA = STEP_ORDER.indexOf(a.type);
    const indexB = STEP_ORDER.indexOf(b.type);
    
    // Si algún tipo no está en el orden definido, ponerlo al final
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  debug.log('Campos ordenados:', { 
    newOrder: sortedFields.map(f => f.type)
  });

  return sortedFields;
}

export function getPublicComponent(field: FormStepField) {
  const debug = {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PreviewMapper] ${message}`, data || '');
      }
    }
  };

  debug.log('Getting component for field:', field);
  const component = componentMap[field.type];
  
  if (!component) {
    debug.log(`No preview component found for field type: ${field.type}`);
  }

  return component;
}

// Función auxiliar para verificar el orden de los pasos
export function validateStepOrder(currentType: string, nextType: string): boolean {
  const debug = {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[StepOrder] ${message}`, data || '');
      }
    }
  };

  debug.log('Validando orden:', { currentType, nextType });
  
  // Si es greeting o users, siempre permitir
  if (currentType === 'greeting' || currentType === 'users') {
    debug.log('Paso inicial, permitiendo navegación');
    return true;
  }

  const currentIndex = STEP_ORDER.indexOf(currentType);
  const nextIndex = STEP_ORDER.indexOf(nextType);
  
  debug.log('Índices:', { currentIndex, nextIndex });
  
  // Verificar que ambos tipos existan en el orden
  if (currentIndex === -1 || nextIndex === -1) {
    debug.log('Uno de los tipos no existe en el orden definido');
    return false;
  }
  
  // Verificar que el siguiente sea mayor que el actual
  const isValid = nextIndex > currentIndex;
  
  debug.log('Resultado de validación:', { isValid });
  return isValid;
}
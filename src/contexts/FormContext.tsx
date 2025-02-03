'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

interface LocationState {
  branchId: string | null;
  branchName?: string;
}

interface ShiftState {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  courtId: string | null;
  courtName?: string;
  price?: number;
}

interface ItemsState {
  selectedItems: Record<string, number>; // itemId -> quantity
}

interface FormState {
  location: LocationState;
  shift: ShiftState;
  items: ItemsState;
  currentStep: number;
}

type FormAction =
  | { type: 'SET_LOCATION'; payload: LocationState }
  | { type: 'SET_SHIFT'; payload: ShiftState }
  | { type: 'SET_ITEMS'; payload: ItemsState }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'CLEAR_AFTER_STEP'; payload: number };

const initialState: FormState = {
  location: {
    branchId: null,
  },
  shift: {
    date: null,
    startTime: null,
    endTime: null,
    duration: 1,
    courtId: null,
    price: 0,
  },
  items: {
    selectedItems: {},
  },
  currentStep: 0,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_LOCATION':
      return {
        ...state,
        location: action.payload,
        // Limpiar estados posteriores
        shift: initialState.shift,
        items: initialState.items,
      };
    
    case 'SET_SHIFT':
      return {
        ...state,
        shift: action.payload,
        // Limpiar estados posteriores
        items: initialState.items,
      };
    
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    
    case 'CLEAR_AFTER_STEP':
      if (action.payload === 0) {
        return {
          ...state,
          shift: initialState.shift,
          items: initialState.items,
        };
      } else if (action.payload === 1) {
        return {
          ...state,
          items: initialState.items,
        };
      }
      return state;
    
    default:
      return state;
  }
}

interface FormContextType {
  state: FormState;
  setLocation: (location: LocationState) => void;
  setShift: (shift: ShiftState) => void;
  setItems: (items: ItemsState) => void;
  setStep: (step: number) => void;
  clearAfterStep: (step: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setLocation = useCallback((location: LocationState) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  }, []);

  const setShift = useCallback((shift: ShiftState) => {
    dispatch({ type: 'SET_SHIFT', payload: shift });
  }, []);

  const setItems = useCallback((items: ItemsState) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const clearAfterStep = useCallback((step: number) => {
    dispatch({ type: 'CLEAR_AFTER_STEP', payload: step });
  }, []);

  return (
    <FormContext.Provider
      value={{
        state,
        setLocation,
        setShift,
        setItems,
        setStep,
        clearAfterStep,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
} 
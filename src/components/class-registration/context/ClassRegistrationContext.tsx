interface ClassRegistrationContextType {
  state: ClassRegistrationState
  actions: ClassRegistrationActions
}

export const ClassRegistrationContext = createContext<ClassRegistrationContextType | null>(null)

export function ClassRegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(classRegistrationReducer, initialState)
  
  const actions = useMemo(() => ({
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    // ... otras acciones
  }), [])

  return (
    <ClassRegistrationContext.Provider value={{ state, actions }}>
      {children}
    </ClassRegistrationContext.Provider>
  )
} 
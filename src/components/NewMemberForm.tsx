import { motion, AnimatePresence } from "framer-motion"
import { IconQuestionMark, IconChevronDown } from "@tabler/icons-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectProvider } from "@/components/ui/select"
import { useState, useEffect } from "react"

interface NewMemberFormProps {
  isOpen: boolean
  onClose: () => void
}

export function NewMemberForm({ isOpen, onClose }: NewMemberFormProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  
  // Agregar un useEffect para cerrar el select cuando se cierra el panel
  useEffect(() => {
    if (!isOpen) {
      setIsSelectOpen(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <SelectProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          />

          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: "100%", 
              opacity: 0,
              transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl border-l z-50"
          >
            <div className="h-full flex flex-col p-6">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.1,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                className="mb-6"
              >
                <div>
                  <motion.h2 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="text-xl font-semibold mb-1"
                  >
                    Registra un nuevo Miembro
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="text-sm text-gray-500"
                  >
                    Complete los datos del nuevo miembro
                  </motion.p>
                </div>
              </motion.div>

              <motion.form 
                className="flex flex-col h-full"
              >
                <div className="flex-1 space-y-6 overflow-y-auto">
                  {[
                    { label: "Nombre completo", type: "text", placeholder: "Ingrese el nombre completo" },
                    { label: "Email", type: "email", placeholder: "Ingrese el email" },
                    { label: "Número", type: "tel", placeholder: "Ingrese el número de teléfono" }
                  ].map((field, index) => (
                    <motion.div 
                      key={field.label}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        delay: 0.3 + (index * 0.05),
                        duration: 0.3
                      }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="w-full pb-2 border-b border-gray-300 focus:border-black outline-none transition-colors bg-transparent"
                        placeholder={field.placeholder}
                      />
                    </motion.div>
                  ))}

                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Plan</label>
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center cursor-help">
                        <IconQuestionMark className="h-3 w-3 text-gray-500" />
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full pb-2 border-b border-gray-300 focus-within:border-black transition-colors">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSelectOpen(!isSelectOpen);
                          }}
                          className="w-full text-left flex items-center justify-between py-1"
                        >
                          <span className="text-sm text-gray-700">
                            {selectedPlan || "Seleccione un plan"}
                          </span>
                          <IconChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                      {isSelectOpen && (
                        <div 
                          className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
                          style={{ zIndex: 99999 }}
                        >
                          {["Sin Plan", "Plan Base", "Plan Pro", "Plan Scale"].map((plan) => (
                            <button
                              key={plan}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedPlan(plan);
                                setIsSelectOpen(false);
                              }}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                            >
                              {plan}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Botones en un contenedor fijo al final */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="pt-6 flex gap-3 mt-auto border-t bg-white"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Guardar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </SelectProvider>
      )}
    </AnimatePresence>
  )
}

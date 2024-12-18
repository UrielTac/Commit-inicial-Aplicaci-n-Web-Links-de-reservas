import { motion } from "framer-motion"



import { useState, useEffect } from "react"



import { cn } from "@/lib/utils"



import type { PaymentMethod } from "../../types"







interface ClassPaymentMethodsProps {



  config: {



    availableMethods: PaymentMethod[]



  }



  onChange: (config: {



    availableMethods: PaymentMethod[]



  }) => void



  onValidationChange: (isValid: boolean) => void



}







const paymentMethods = [



  {



    id: 'cash' as const,



    label: 'Pagar en la sede',



    description: 'El cliente paga al llegar'



  },



  {



    id: 'card' as const,



    label: 'Mercado Pago',



    description: 'Pago por medio de Mercado Pago'



  },



  {



    id: 'transfer' as const,



    label: 'Transferencia',



    description: 'Transferencia bancaria'



  }



]







export function ClassPaymentMethods({



  config,



  onChange,



  onValidationChange



}: ClassPaymentMethodsProps) {



  useEffect(() => {



    onValidationChange(config.availableMethods.length > 0)



  }, [config.availableMethods, onValidationChange])







  const togglePaymentMethod = (method: PaymentMethod) => {



    const newMethods = config.availableMethods.includes(method)



      ? config.availableMethods.filter(m => m !== method)



      : [...config.availableMethods, method]



    



    onChange({



      ...config,



      availableMethods: newMethods



    })



  }







  return (



    <motion.div



      initial={{ opacity: 0, y: 20 }}



      animate={{ opacity: 1, y: 0 }}



      className="space-y-8"



    >



      <div className="space-y-4">



        <div className="grid gap-3">



          {paymentMethods.map(({ id, label, description }) => (



            <motion.div



              key={id}



              initial={{ opacity: 0, y: 10 }}



              animate={{ opacity: 1, y: 0 }}



              className="group"



            >



              <button



                onClick={() => togglePaymentMethod(id)}



                className={cn(



                  "w-full p-4 rounded-lg transition-all duration-200",



                  "hover:bg-gray-50",



                  config.availableMethods.includes(id)



                    ? "bg-gray-50 ring-1 ring-black/5"



                    : "bg-white border border-gray-200"



                )}



              >



                <div className="flex items-center justify-between gap-4">



                  <div className="flex-1 text-left">



                    <p className={cn(



                      "font-medium transition-colors duration-200",



                      config.availableMethods.includes(id)



                        ? "text-gray-900"



                        : "text-gray-700"



                    )}>



                      {label}



                    </p>



                    <p className={cn(



                      "text-sm transition-colors duration-200",



                      config.availableMethods.includes(id)



                        ? "text-gray-600"



                        : "text-gray-500"



                    )}>



                      {description}



                    </p>



                  </div>



                  <div className={cn(



                    "w-4 h-4 rounded-full border-2 transition-all duration-200",



                    config.availableMethods.includes(id)



                      ? "border-black bg-black"



                      : "border-gray-300",



                    "flex items-center justify-center"



                  )}>



                    {config.availableMethods.includes(id) && (



                      <motion.div



                        initial={{ scale: 0 }}



                        animate={{ scale: 1 }}



                        className="w-1.5 h-1.5 bg-white rounded-full"



                      />



                    )}



                  </div>



                </div>



              </button>



            </motion.div>



          ))}



        </div>



      </div>







      {config.availableMethods.length === 0 && (



        <motion.p



          initial={{ opacity: 0 }}



          animate={{ opacity: 1 }}



          className="text-[13px] text-gray-400 text-center"



        >



          Selecciona al menos un método de pago para continuar



        </motion.p>



      )}



    </motion.div>



  )



} 







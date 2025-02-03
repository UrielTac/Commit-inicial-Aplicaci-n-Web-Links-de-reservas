'use client';

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect } from "react";
import { CardSetupForm } from "../components/CardSetupForm";
import { useStripeConnection } from "@/hooks/useStripeConnection";
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { SavedCard } from "../components/SavedCard";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  viewType: "mobile" | "desktop";
  onSelect: (methodId: string) => void;
  isPublicView?: boolean;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  theme,
  viewType,
  onSelect: handleCardSelect,
  isPublicView = false
}: PaymentMethodModalProps) {
  const [showCardForm, setShowCardForm] = useState(false);
  const { stripeAccountId } = useStripeConnection();
  
  // Configuración mejorada del carrusel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'keepSnaps',
    loop: false,
    inViewThreshold: 0.7
  });

  // Estado para el índice actual
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Actualizar el índice al deslizar
  const handleSlideSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Suscribirse a los eventos del carrusel
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', handleSlideSelect);
    emblaApi.on('reInit', handleSlideSelect);

    return () => {
      emblaApi.off('select', handleSlideSelect);
      emblaApi.off('reInit', handleSlideSelect);
    };
  }, [emblaApi, handleSlideSelect]);

  // Estado para las tarjetas guardadas (ejemplo)
  const [savedCards] = useState([
    {
      id: '1',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '25'
    }
    // Aquí se cargarían las tarjetas reales desde Stripe
  ]);

  const handleAddCard = () => {
    setShowCardForm(true);
  };

  const handleBack = () => {
    setShowCardForm(false);
  };

  const handleCardSetupSuccess = (paymentMethodId: string) => {
    setShowCardForm(false);
    handleCardSelect(paymentMethodId);
    onClose();
  };

  const handleCardSetupError = (error: any) => {
    console.error('Error al configurar la tarjeta:', error);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className={cn(
              "bg-black z-[60]",
              isPublicView ? "fixed inset-0" : "absolute inset-0"
            )}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.5
            }}
            className={cn(
              viewType === "mobile"
                ? "fixed bottom-0 left-0 right-0 min-h-[500px] max-h-[70vh]"
                : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[600px]",
              theme === 'dark' ? "bg-neutral-900" : "bg-white",
              "shadow-xl z-[70] rounded-t-xl overflow-hidden flex flex-col"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-neutral-800 flex-shrink-0">
              <div className="p-4 pb-3">
                {viewType === "mobile" && (
                  <div className="flex justify-center -mt-2 mb-3">
                    <div className={cn(
                      "w-10 h-1 rounded-full",
                      theme === 'dark' ? "bg-neutral-800" : "bg-gray-200"
                    )} />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={cn(
                      viewType === "mobile" ? "text-base" : "text-lg",
                      "font-medium mb-1",
                      theme === 'dark' ? "text-white" : "text-gray-900"
                    )}>
                      {showCardForm ? 'Agregar Nueva Tarjeta' : 'Tarjetas Guardadas'}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? "text-gray-400" : "text-gray-500"
                    )}>
                      {showCardForm 
                        ? 'Ingresa los datos de tu tarjeta'
                        : 'Desliza para ver todas tus tarjetas'
                      }
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className={cn(
                      "p-1.5 rounded-md transition-colors self-start -mt-1",
                      theme === 'dark' 
                        ? "text-gray-400 hover:bg-neutral-800"
                        : "text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {showCardForm ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {stripeAccountId && (
                      <CardSetupForm
                        stripeAccountId={stripeAccountId}
                        onSuccess={handleCardSetupSuccess}
                        onError={handleCardSetupError}
                        onBack={handleBack}
                        theme={theme}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex flex-col"
                  >
                    {/* Carrusel de tarjetas */}
                    <div className="overflow-hidden flex-1" ref={emblaRef}>
                      <div className="flex h-full items-center">
                        {savedCards.map((card) => (
                          <div 
                            key={card.id} 
                            className={cn(
                              "flex-[0_0_100%] min-w-0 transition-transform duration-300",
                              "px-4"
                            )}
                          >
                            <SavedCard
                              {...card}
                              theme={theme}
                              onClick={() => handleCardSelect(card.id)}
                            />
                          </div>
                        ))}
                        {/* Botón de agregar tarjeta */}
                        <div className="flex-[0_0_100%] min-w-0 px-4">
                          <button
                            onClick={handleAddCard}
                            className={cn(
                              "w-full p-6 rounded-xl flex flex-col items-center justify-center gap-4",
                              "border-2 border-dashed h-[200px]",
                              theme === 'dark'
                                ? "border-neutral-700 hover:border-neutral-600 text-gray-400"
                                : "border-gray-200 hover:border-gray-300 text-gray-600",
                              "transition-colors"
                            )}
                          >
                            <Plus className="h-8 w-8" />
                            <span>Agregar Nueva Tarjeta</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
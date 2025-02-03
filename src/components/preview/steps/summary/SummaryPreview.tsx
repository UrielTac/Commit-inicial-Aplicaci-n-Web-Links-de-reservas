import { FormStepField } from "@/types/form-steps";
import { PreviewContainer } from "../../layout/PreviewContainer";
import { NavigationButtons } from "../../layout/NavigationButtons";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSummaryState } from "./hooks/useSummaryState";
import { PAYMENT_METHODS, AVAILABLE_COUPONS } from "./constants";
import { PriceBreakdown } from "./components/PriceBreakdown";
import { PaymentSection } from "./components/PaymentSection";
import { PaymentTypeSection } from "./components/PaymentTypeSection";
import { CouponsSection } from "./components/CouponsSection";
import { ItemsDetailsModal } from "./modals/ItemsDetailsModal";
import { PaymentMethodModal } from "./modals/PaymentMethodModal";
import { PaymentTypeModal } from "./modals/PaymentTypeModal";
import { CouponsModal } from "./modals/CouponsModal";
import { TotalPrice } from "./components/TotalPrice";
import { PreviewPopup } from "../../shared/PreviewPopup";
import { useState } from "react";
import { SummaryStepField } from "@/components/steps/summary/types";
import { PaymentMethod, Coupon } from "./types";

interface SummaryPreviewProps {
  field: SummaryStepField;
  theme: 'light' | 'dark';
  viewType: "mobile" | "desktop";
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isPublicView?: boolean;
}

export function SummaryPreview({ 
  field, 
  theme, 
  viewType,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isPublicView = false
}: SummaryPreviewProps) {
  const { 
    calculations,
    showItemsDetails,
    showPaymentMethods,
    showPaymentTypes,
    showCouponsPanel,
    setShowItemsDetails,
    setShowPaymentMethods,
    setShowPaymentTypes,
    setShowCouponsPanel,
    handleApplyCoupon,
    handleSelectPaymentMethod,
    handleSelectPaymentType,
    handleRemoveCoupon,
    appliedCoupon,
    selectedPaymentMethod,
    selectedPaymentType,
    couponCode,
    setCouponCode,
    couponError,
    setCouponError
  } = useSummaryState();

  const [showPopup, setShowPopup] = useState(false);

  const selectedPaymentMethodData = selectedPaymentMethod 
    ? PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod) ?? null
    : null;

  const handleModalAction = (action: () => void) => {
    if (!isPublicView) {
      setShowPopup(true);
      return;
    }
    action();
  };

  return (
    <PreviewContainer 
      viewType={viewType} 
      theme={theme}
      onNext={onNext}
      onPrev={onPrev}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
      nextLabel="Reservar"
      prevLabel="Volver"
      isPublicView={isPublicView}
    >
      <div className="min-h-full flex flex-col">
        <div className="flex-1">
          <div className="pb-24">
            <div className="space-y-4 px-4 pt-6">
              {/* Precio Total */}
              <TotalPrice total={calculations.total} theme={theme} />

              {/* Desglose de Precios */}
              <PriceBreakdown
                theme={theme}
                calculations={calculations}
                onShowItemsDetails={() => handleModalAction(() => setShowItemsDetails(true))}
              />

              {/* Sección de Cupones */}
              <CouponsSection
                theme={theme}
                appliedCoupon={appliedCoupon as Coupon | null}
                onShowCoupons={() => handleModalAction(() => setShowCouponsPanel(true))}
                onRemoveCoupon={handleRemoveCoupon}
              />

              {/* Sección de Método de Pago */}
              <PaymentTypeSection
                theme={theme}
                selectedType={selectedPaymentType}
                onShowTypes={() => handleModalAction(() => setShowPaymentTypes(true))}
                onRemoveType={() => handleSelectPaymentType(null)}
              />

              {/* Sección de Medio de Pago */}
              <PaymentSection
                theme={theme}
                selectedMethod={selectedPaymentMethodData}
                onShowMethods={() => handleModalAction(() => setShowPaymentMethods(true))}
                onRemoveMethod={() => handleSelectPaymentMethod(null)}
              />
            </div>
          </div>
        </div>

        {/* Modales */}
        <ItemsDetailsModal
          isOpen={Boolean(showItemsDetails && isPublicView)}
          onClose={() => setShowItemsDetails(false)}
          theme={theme}
          viewType={viewType}
          items={calculations.selectedItems}
          isPublicView={isPublicView}
        />

        <PaymentMethodModal
          isOpen={Boolean(showPaymentMethods && isPublicView)}
          onClose={() => setShowPaymentMethods(false)}
          theme={theme}
          viewType={viewType}
          onSelect={handleSelectPaymentMethod}
          onAddCard={() => {
            setShowPaymentMethods(false);
          }}
          isPublicView={isPublicView}
        />

        <PaymentTypeModal
          isOpen={Boolean(showPaymentTypes && isPublicView)}
          onClose={() => setShowPaymentTypes(false)}
          theme={theme}
          viewType={viewType}
          onSelect={(type, config) => {
            handleSelectPaymentType(type);
            if (config?.paymentMethodId) {
              handleSelectPaymentMethod(config.paymentMethodId);
            }
          }}
          isPublicView={isPublicView}
        />

        <CouponsModal
          isOpen={Boolean(showCouponsPanel && isPublicView)}
          onClose={() => setShowCouponsPanel(false)}
          theme={theme}
          viewType={viewType}
          onApply={handleApplyCoupon}
          availableCoupons={AVAILABLE_COUPONS}
          isPublicView={isPublicView}
        />

        {/* Pop-up informativo */}
        <PreviewPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          theme={theme}
        />
      </div>
    </PreviewContainer>
  );
} 
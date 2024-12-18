import { motion } from "framer-motion"
import { ClassDetails } from "./ClassDetails"
import { ClassSchedule } from "./ClassSchedule"
import { ClassPaymentMethods } from "./ClassPaymentMethods"
import { ClassConfirmationStep } from "./ClassConfirmationStep"
import { courts } from "@/lib/data"
import type { 
  BookingStep, 
  TimeSelection, 
  ClassDetails as IClassDetails, 
  ClassScheduleConfig,
  ClassPaymentConfig
} from "../../types"

interface ClassBookingProps {
  currentStep: BookingStep
  selectedDate?: Date
  selectedCourts: string[]
  timeSelection?: TimeSelection
  classDetails?: IClassDetails
  scheduleConfig?: ClassScheduleConfig
  paymentConfig: ClassPaymentConfig
  onDateSelect: (date: Date) => void
  onCourtSelect: (courts: string[]) => void
  onTimeSelect: (time: TimeSelection) => void
  onClassDetailsChange: (details: IClassDetails) => void
  onScheduleConfigChange: (config: ClassScheduleConfig) => void
  onPaymentConfigChange: (config: ClassPaymentConfig) => void
  onValidationChange: (isValid: boolean) => void
}

export function ClassBooking({
  currentStep,
  selectedDate,
  selectedCourts,
  timeSelection,
  classDetails,
  scheduleConfig,
  paymentConfig,
  onDateSelect,
  onCourtSelect,
  onTimeSelect,
  onClassDetailsChange,
  onScheduleConfigChange,
  onPaymentConfigChange,
  onValidationChange
}: ClassBookingProps) {

  const renderStep = () => {
    switch (currentStep) {
      case 'class-details':
        return (
          <ClassDetails
            details={classDetails}
            onChange={onClassDetailsChange}
            onValidationChange={onValidationChange}
          />
        )
      
      case 'class-schedule':
        return (
          <ClassSchedule
            config={scheduleConfig}
            onChange={onScheduleConfigChange}
            onValidationChange={onValidationChange}
          />
        )
      
      case 'class-payment-methods':
        return (
          <ClassPaymentMethods
            config={paymentConfig}
            onChange={onPaymentConfigChange}
            onValidationChange={onValidationChange}
          />
        )
      
      case 'confirmation':
        return (
          <ClassConfirmationStep
            selectedDate={scheduleConfig?.startDate}
            selectedCourts={selectedCourts}
            courts={courts}
            className={classDetails?.name}
            visibility={classDetails?.visibility || 'public'}
          />
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6"
    >
      {renderStep()}
    </motion.div>
  )
} 
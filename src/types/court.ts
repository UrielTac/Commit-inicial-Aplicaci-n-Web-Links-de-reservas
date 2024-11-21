export type Sport = 'padel' | 'tennis' | 'badminton' | 'pickleball' | 'squash'
export type CourtType = 'indoor' | 'outdoor' | 'covered'
export type SurfaceType = 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium'
export type DurationOption = 30 | 45 | 60 | 90 | 120

export interface TimeRange {
  startTime: string
  endTime: string
  percentage: number
}

export interface DayPricing {
  isSelected: boolean
  timeRanges: TimeRange[]
}

export interface CustomPricingConfig {
  [key: number]: DayPricing
}

export interface Court {
  id: string
  name: string
  branchId: string
  sport: Sport
  courtType: CourtType
  surface: SurfaceType
  features: string[]
  isActive: boolean
  availableDurations: DurationOption[]
  durationPricing: {
    [key: number]: number
  }
  customPricing: CustomPricingConfig
  createdAt: string
  updatedAt: string
}

export interface CreateCourtDTO {
  name: string
  branchId: string
  sport: Sport
  courtType: CourtType
  surface: SurfaceType
  features?: string[]
  isActive?: boolean
  availableDurations?: DurationOption[]
  durationPricing?: {
    [key: number]: number
  }
  customPricing?: CustomPricingConfig
} 
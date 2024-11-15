export type SurfaceType = 'crystal' | 'synthetic' | 'clay' | 'grass' | 'rubber' | 'concrete' | 'panoramic' | 'premium';

export type DurationOption = 30 | 45 | 60 | 90 | 120;

export interface TimeRange {
  start: string; // formato "HH:mm"
  end: string;   // formato "HH:mm"
  price: number;
}

export interface DayPricing {
  default: number;
  timeRanges?: TimeRange[];
}

export interface CourtPricing {
  default: number;
  defaultTimeRanges?: TimeRange[];
  byDay?: {
    monday?: DayPricing;
    tuesday?: DayPricing;
    wednesday?: DayPricing;
    thursday?: DayPricing;
    friday?: DayPricing;
    saturday?: DayPricing;
    sunday?: DayPricing;
  };
}

export interface Court {
  id: string;
  name: string;
  isIndoor: boolean;
  surface: SurfaceType;
  isActive: boolean;
  hasLighting: boolean;
  availableDurations: DurationOption[];
  pricing: CourtPricing;
} 
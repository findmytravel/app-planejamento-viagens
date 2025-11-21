export interface TravelMatchForm {
  departureCity: string;
  tripTypes: string[];
  company: string;
  numberOfTravelers: number;
  companions: Array<{ name: string; relation: string }>;
  destinationTypes: string[];
  activities: string[];
  beachActivities: string[];
  seaTemperature: string;
  seaType: string;
  seaColor: string;
  accommodation: string[];
  beachfront: string;
  duration: number | null;
  travelDateType: "dates" | "month" | "";
  departureDate: string;
  returnDate: string;
  month: string;
  monthDuration: number | null;
  budgetType: "total" | "per-person";
  budget: number | null;
}

export interface KnownDestinationForm {
  destinations: string[];
  travelDate: string;
  duration: string;
  budget: number | null;
  budgetType: "per-person" | "total";
  travelers: string;
  activities: string[];
}

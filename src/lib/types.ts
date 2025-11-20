// Tipos principais do FindMyTravel

export type TripStatus = 'planning' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  name: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  description: string;
  destination: string;
  status: TripStatus;
  collaborators: User[];
  totalBudget?: number;
  spentAmount?: number;
  itemsCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  day: number;
  type: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'other';
  name: string;
  description?: string;
  location: Location;
  startTime?: string;
  endTime?: string;
  duration?: number;
  cost?: number;
  notes?: string;
  bookingReference?: string;
  order: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  amount: number;
  currency: string;
  description: string;
  date: string;
  paidBy: string;
  splitBetween: string[];
  receipt?: string;
}

export interface List {
  id: string;
  tripId: string;
  name: string;
  type: 'restaurants' | 'attractions' | 'documents' | 'packing' | 'custom';
  items: ListItem[];
}

export interface ListItem {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
}

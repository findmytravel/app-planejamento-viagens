import { Trip, ItineraryItem } from './types';

// Dados mockados para demonstração
export const mockTrips: Trip[] = [
  {
    id: '1',
    name: 'Paris e Provence',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=400&fit=crop',
    startDate: '2024-06-15',
    endDate: '2024-06-25',
    description: 'Explorando a cidade luz e os campos de lavanda',
    destination: 'Paris, França',
    status: 'planning',
    collaborators: [
      { id: '1', name: 'Você', email: 'you@example.com' },
      { id: '2', name: 'Maria Silva', email: 'maria@example.com' }
    ],
    totalBudget: 15000,
    spentAmount: 3200,
    itemsCount: 24
  },
  {
    id: '2',
    name: 'Tóquio e Kyoto',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop',
    startDate: '2024-09-10',
    endDate: '2024-09-20',
    description: 'Cultura milenar e tecnologia de ponta',
    destination: 'Tóquio, Japão',
    status: 'planning',
    collaborators: [
      { id: '1', name: 'Você', email: 'you@example.com' }
    ],
    totalBudget: 25000,
    spentAmount: 8500,
    itemsCount: 18
  },
  {
    id: '3',
    name: 'Costa Amalfitana',
    coverImage: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&h=400&fit=crop',
    startDate: '2024-04-01',
    endDate: '2024-04-10',
    description: 'Praias paradisíacas e gastronomia italiana',
    destination: 'Amalfi, Itália',
    status: 'completed',
    collaborators: [
      { id: '1', name: 'Você', email: 'you@example.com' },
      { id: '3', name: 'João Santos', email: 'joao@example.com' },
      { id: '4', name: 'Ana Costa', email: 'ana@example.com' }
    ],
    totalBudget: 12000,
    spentAmount: 11800,
    itemsCount: 32
  },
  {
    id: '4',
    name: 'Nova York',
    coverImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop',
    startDate: '2024-12-20',
    endDate: '2024-12-28',
    description: 'Natal na Big Apple',
    destination: 'Nova York, EUA',
    status: 'planning',
    collaborators: [
      { id: '1', name: 'Você', email: 'you@example.com' }
    ],
    itemsCount: 8
  }
];

export const mockUser = {
  id: '1',
  name: 'Você',
  email: 'you@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
};

// Itinerário mockado para a viagem de Paris
export const mockItinerary: ItineraryItem[] = [
  {
    id: 'item-1',
    tripId: '1',
    day: 1,
    type: 'hotel',
    name: 'Hotel Le Marais',
    description: 'Check-in no hotel boutique no coração de Paris',
    location: {
      lat: 48.8566,
      lng: 2.3522,
      address: '15 Rue des Archives, 75004 Paris, França'
    },
    startTime: '14:00',
    endTime: '15:00',
    cost: 450,
    order: 0
  },
  {
    id: 'item-2',
    tripId: '1',
    day: 1,
    type: 'attraction',
    name: 'Torre Eiffel',
    description: 'Visita ao símbolo mais icônico de Paris',
    location: {
      lat: 48.8584,
      lng: 2.2945,
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, França'
    },
    startTime: '16:00',
    endTime: '18:30',
    duration: 150,
    cost: 26,
    order: 1
  },
  {
    id: 'item-3',
    tripId: '1',
    day: 1,
    type: 'restaurant',
    name: 'Le Jules Verne',
    description: 'Jantar com vista panorâmica no segundo andar da Torre Eiffel',
    location: {
      lat: 48.8583,
      lng: 2.2945,
      address: 'Avenue Gustave Eiffel, 75007 Paris, França'
    },
    startTime: '19:30',
    endTime: '22:00',
    cost: 180,
    order: 2
  },
  {
    id: 'item-4',
    tripId: '1',
    day: 2,
    type: 'attraction',
    name: 'Museu do Louvre',
    description: 'Explorar a maior coleção de arte do mundo',
    location: {
      lat: 48.8606,
      lng: 2.3376,
      address: 'Rue de Rivoli, 75001 Paris, França'
    },
    startTime: '09:00',
    endTime: '13:00',
    duration: 240,
    cost: 17,
    order: 0
  },
  {
    id: 'item-5',
    tripId: '1',
    day: 2,
    type: 'restaurant',
    name: 'Café de Flore',
    description: 'Almoço no histórico café parisiense',
    location: {
      lat: 48.8542,
      lng: 2.3320,
      address: '172 Boulevard Saint-Germain, 75006 Paris, França'
    },
    startTime: '13:30',
    endTime: '15:00',
    cost: 45,
    order: 1
  },
  {
    id: 'item-6',
    tripId: '1',
    day: 2,
    type: 'attraction',
    name: 'Catedral de Notre-Dame',
    description: 'Visita à icônica catedral gótica',
    location: {
      lat: 48.8530,
      lng: 2.3499,
      address: '6 Parvis Notre-Dame, 75004 Paris, França'
    },
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    cost: 0,
    order: 2
  },
  {
    id: 'item-7',
    tripId: '1',
    day: 3,
    type: 'attraction',
    name: 'Arco do Triunfo',
    description: 'Monumento histórico na Champs-Élysées',
    location: {
      lat: 48.8738,
      lng: 2.2950,
      address: 'Place Charles de Gaulle, 75008 Paris, França'
    },
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    cost: 13,
    order: 0
  },
  {
    id: 'item-8',
    tripId: '1',
    day: 3,
    type: 'restaurant',
    name: 'Ladurée Champs-Élysées',
    description: 'Brunch e macarons na famosa patisserie',
    location: {
      lat: 48.8698,
      lng: 2.3075,
      address: '75 Avenue des Champs-Élysées, 75008 Paris, França'
    },
    startTime: '12:00',
    endTime: '13:30',
    cost: 55,
    order: 1
  }
];

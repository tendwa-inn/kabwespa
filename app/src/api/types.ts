export type Service = {
  id: string;
  category: "massage" | "beauty";
  name: string;
  price: number;
  photo: string | null;
  description: string;
  videoUrl: string | null;
};

export type WelcomeSlide = {
  id: string;
  caption: string;
  photo: string | null;
};

export type LocationCoords = { lat: number; lng: number };

export type LocationPhoto = {
  id: string;
  photo: string;
  caption: string;
};

export type Settings = {
  logo: string | null;
  heroPhoto: string | null;
  centerPhone: string;
  whatsappNumbers: string[];
  whatsappBubbleNumber: string;
  location: string;
  locationCoords: LocationCoords | null;
  locationPhotos: LocationPhoto[];
  welcomeSlides: WelcomeSlide[];
};

export type AssistantCategory =
  | "location"
  | "contact"
  | "massage"
  | "beauty"
  | "videos"
  | "booking"
  | "general";

export type AssistantQuestion = {
  id: string;
  question: string;
  answer: string;
  category: AssistantCategory;
};

export type Appointment = {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  category: "massage" | "beauty";
  originalPrice: number;
  price: number;
  promoCode: string | null;
  date: string;
  time: string;
  notes: string;
  status: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  type: "income" | "expense";
  serviceId?: string;
  serviceName?: string;
  standardPrice?: number;
  isDiscounted?: boolean;
  description?: string;
  notes?: string;
  amount: number;
  createdAt: string;
  createdBy: string;
};

export type TransactionsSummary = {
  income: number;
  expense: number;
  carriedForward: number;
  balance: number;
};

export type CarriedForwardEntry = {
  id: string;
  amount: number;
  note: string;
  createdAt: string;
  createdBy: string;
};

export type PromoCode = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  serviceId: string | null;
  serviceName: string;
  expiresAt: string | null;
  maxUses: number | null;
  usesCount: number;
  createdAt: string;
};

export type UserRole = "user" | "manager";

export type AdminUserRow = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  area: string;
  verified: boolean;
  role: UserRole;
  createdAt: string;
  appointmentCount: number;
};

export type User = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  area: string;
  photo: string | null;
  verified: boolean;
  role: UserRole;
};

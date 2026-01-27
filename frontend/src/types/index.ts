export type UserRole = 'ADMIN' | 'GUARDIAN' | 'STAFF';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type PassType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type WorkshopDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  rut?: string;
  address?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  rut?: string;
  school?: string;
  grade?: string;
  photoUrl?: string;
  guardianId: string;
  guardian?: User;
  preferences?: ChildPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ChildPreferences {
  id: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  dietaryRestrictions?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  authorizedPickup?: string;
  notes?: string;
  childId: string;
}

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isActive: boolean;
  daysOfWeek: number[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  date: string;
  passType: PassType;
  status: BookingStatus;
  weeklyFrequency?: number;
  unitPrice: string;
  totalPrice: string;
  discountApplied?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  childId: string;
  child?: Child;
  slotId: string;
  slot?: TimeSlot;
  payment?: Payment;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  periodMonth: number;
  periodYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  childId: string;
  child?: Child;
  date: string;
  timeSlotId: string;
  timeSlot?: TimeSlot;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedById?: string;
  recordedBy?: User;
  createdAt: string;
}

export interface Workshop {
  id: string;
  name: string;
  description?: string;
  dayOfWeek: WorkshopDay;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopEnrollment {
  id: string;
  workshopId: string;
  workshop?: Workshop;
  childId: string;
  child?: Child;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  userId: string;
  user?: User;
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PricingConfig {
  weeklyFrequency: number;
  pricePerSession: number;
}

export interface DiscountConfig {
  id: string;
  name: string;
  percentage: number;
  description?: string;
  requiresEarlyPayment: boolean;
  earlyPaymentDay?: number;
}

export interface DashboardStats {
  childrenCount: number;
  activeBookings: number;
  pendingPayments: number;
  pendingAmount: number;
}

export interface ContentBlock {
  slug: string;
  title: string;
  content: string;
}

export interface SystemSettings {
  key: string;
  value: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

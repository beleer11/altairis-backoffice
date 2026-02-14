export enum BookingStatus {
    Pending = 0,
    Confirmed = 1,
    CheckedIn = 2,
    CheckedOut = 3,
    Cancelled = 4,
    NoShow = 5,
}

export const BookingStatusLabels: Record<BookingStatus, string> = {
    [BookingStatus.Pending]: "Pendiente",
    [BookingStatus.Confirmed]: "Confirmada",
    [BookingStatus.CheckedIn]: "Check-in",
    [BookingStatus.CheckedOut]: "Check-out",
    [BookingStatus.Cancelled]: "Cancelada",
    [BookingStatus.NoShow]: "No Show",
};

export interface Hotel {
    id: number;
    name: string;
    description?: string | null;
    address: string;
    city?: string | null;
    country?: string | null;
    starRating: number;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    createdAt: string;
    isActive: boolean;
    roomTypes?: RoomType[] | null;
}

export interface RoomType {
    id: number;
    name: string;
    description?: string | null;
    capacity: number;
    totalRooms: number;
    basePrice: number;
    hotelId: number;
    hotel?: Hotel;
    inventories?: RoomInventory[] | null;
    bookings?: Booking[] | null;
}

export interface RoomInventory {
    id: number;
    roomTypeId: number;
    roomType?: RoomType;
    date: string;
    availableRooms: number;
    bookedRooms: number;
    pricePerNight: number;
}

export interface Booking {
    id: number;
    bookingReference?: string | null;
    roomTypeId: number;
    roomType?: RoomType;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail?: string | null;
    guestPhone?: string | null;
    numberOfGuests: number;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
    notes?: string | null;
}

// Request types
export interface UpdateInventoryRequest {
    roomTypeId: number;
    date: string;
    availableRooms?: number;
    price?: number;
}

export interface GenerateInventoryRequest {
    roomTypeId: number;
    startDate: string;
    endDate: string;
}

// Pagination
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
    totalHotels: number;
    totalRooms: number;
    activeBookings: number;
    revenue: number;
    occupancyRate: number;
}

export interface OccupancyData {
    date: string;
    occupancy: number;
    available: number;
    booked: number;
}
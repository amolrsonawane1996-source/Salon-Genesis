import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type BookingStatus = "Confirmed" | "Completed" | "Cancelled";
export type PaymentMethod = "Cash" | "UPI";

export interface Booking {
  id: string;
  userId: string;
  salonId: string;
  salonName: string;
  salonCity: string;
  service: string;
  servicePrice: number;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  createdAt: string;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (data: Omit<Booking, "id" | "createdAt" | "status">) => Promise<void>;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
}

const BOOKINGS_KEY = "@ngs_bookings";

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      if (stored) {
        setBookings(JSON.parse(stored));
      } else {
        const seed: Booking[] = [
          {
            id: "seed-1",
            userId: "demo-customer",
            salonId: "1",
            salonName: "Royal Salon",
            salonCity: "Nashik",
            service: "Haircut",
            servicePrice: 200,
            date: "25 Jun 2026",
            time: "11:00 AM",
            paymentMethod: "Cash",
            status: "Confirmed",
            createdAt: new Date().toISOString(),
          },
          {
            id: "seed-2",
            userId: "demo-customer",
            salonId: "2",
            salonName: "Style King Salon",
            salonCity: "Mumbai",
            service: "Facial",
            servicePrice: 600,
            date: "20 Jun 2026",
            time: "03:00 PM",
            paymentMethod: "UPI",
            status: "Completed",
            createdAt: new Date().toISOString(),
          },
          {
            id: "seed-3",
            userId: "demo-customer",
            salonId: "3",
            salonName: "Luxury Hair Studio",
            salonCity: "Pune",
            service: "Hair Spa",
            servicePrice: 1500,
            date: "15 Jun 2026",
            time: "01:00 PM",
            paymentMethod: "UPI",
            status: "Cancelled",
            createdAt: new Date().toISOString(),
          },
        ];
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(seed));
        setBookings(seed);
      }
    } catch {}
  }

  async function addBooking(data: Omit<Booking, "id" | "createdAt" | "status">) {
    const newBooking: Booking = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  async function updateStatus(id: string, status: BookingStatus) {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    setBookings(updated);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  const getUserBookings = useCallback(
    (userId: string) => bookings.filter((b) => b.userId === userId),
    [bookings]
  );

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateStatus, getUserBookings }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
}

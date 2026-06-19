import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "customer" | "owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  state: string;
  whatsapp?: string;
  gender?: string;
  dob?: string;
  salonName?: string;
  businessAddress?: string;
  department?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  city: string;
  state: string;
}

const DEMO_USERS = [
  {
    id: "demo-customer",
    name: "Rahul Sharma",
    email: "user@gmail.com",
    password: "user123",
    phone: "9876543210",
    role: "customer" as UserRole,
    city: "Nashik",
    state: "Maharashtra",
    gender: "Male",
    bio: "I love trying new hairstyles!",
  },
  {
    id: "demo-owner",
    name: "Salon Owner",
    email: "owner@salon.com",
    password: "owner123",
    phone: "9765432109",
    role: "owner" as UserRole,
    city: "Mumbai",
    state: "Maharashtra",
    salonName: "Style King Salon",
    whatsapp: "9765432109",
    businessAddress: "Linking Road, Bandra West, Mumbai",
  },
  {
    id: "demo-admin",
    name: "Amol Sonawane",
    email: "amolrsonawane1996@gmail.com",
    password: "amol19961411",
    phone: "9654321098",
    role: "admin" as UserRole,
    city: "Pune",
    state: "Maharashtra",
    department: "Platform Management",
  },
];

const AUTH_STORAGE_KEY = "@ngs_user";
const USERS_STORAGE_KEY = "@ngs_users";
const DEMO_OVERRIDES_KEY = "@ngs_demo_overrides";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    const trimEmail = email.trim().toLowerCase();
    const demo = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === trimEmail && u.password === password
    );
    if (demo) {
      const { password: _pw, ...baseData } = demo;
      // Apply any saved overrides for demo accounts
      try {
        const overridesRaw = await AsyncStorage.getItem(DEMO_OVERRIDES_KEY);
        const overrides: Record<string, Partial<User>> = overridesRaw
          ? JSON.parse(overridesRaw)
          : {};
        const userData: User = { ...baseData, ...(overrides[demo.id] ?? {}) };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
      } catch {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(baseData));
        setUser(baseData);
      }
      return { success: true, message: "Login successful" };
    }

    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<RegisterData & { id: string }> = stored
        ? JSON.parse(stored)
        : [];
      const found = users.find(
        (u) => u.email.toLowerCase() === trimEmail && u.password === password
      );
      if (found) {
        const { password: _pw, ...userData } = found;
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData as User);
        return { success: true, message: "Login successful" };
      }
    } catch {}

    return { success: false, message: "Invalid email or password" };
  }

  async function register(
    data: RegisterData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: Array<RegisterData & { id: string }> = stored
        ? JSON.parse(stored)
        : [];
      const exists = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (exists)
        return { success: false, message: "Email already registered" };

      const newUser = { ...data, id: Date.now().toString() };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      const { password: _pw, ...userData } = newUser;
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData as User);
      return { success: true, message: "Registration successful" };
    } catch {
      return { success: false, message: "Registration failed. Try again." };
    }
  }

  async function updateProfile(
    data: Partial<User>
  ): Promise<{ success: boolean; message: string }> {
    if (!user) return { success: false, message: "Not logged in" };
    try {
      const updated: User = { ...user, ...data };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      setUser(updated);

      // If demo account, persist overrides separately so login restores them
      const isDemoAccount = DEMO_USERS.some((d) => d.id === user.id);
      if (isDemoAccount) {
        const overridesRaw = await AsyncStorage.getItem(DEMO_OVERRIDES_KEY);
        const overrides: Record<string, Partial<User>> = overridesRaw
          ? JSON.parse(overridesRaw)
          : {};
        overrides[user.id] = { ...(overrides[user.id] ?? {}), ...data };
        await AsyncStorage.setItem(DEMO_OVERRIDES_KEY, JSON.stringify(overrides));
      } else {
        // Update in the registered users list too
        const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        const users: Array<any> = stored ? JSON.parse(stored) : [];
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...data };
          await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }

      return { success: true, message: "Profile updated successfully" };
    } catch {
      return { success: false, message: "Failed to update profile. Try again." };
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

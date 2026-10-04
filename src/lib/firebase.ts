import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Client Configuration
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForStorefrontFirebaseDemo01",
  authDomain: "dealkart-store.firebaseapp.com",
  projectId: "dealkart-store",
  storageBucket: "dealkart-store.appspot.com",
  messagingSenderId: "85878255672",
  appId: "1:85878255672:web:a1b2c3d4e5f6g7h8i9j0",
};

// Initialize Firebase App safely
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  country?: string;
  registeredAt: string;
}

const CUSTOMERS_STORAGE_KEY = 'dealkart_registered_customers';
const CURRENT_CUSTOMER_KEY = 'dealkart_active_customer';

/**
 * Get all registered customers from persistent storage (No demo accounts)
 */
export function getRegisteredCustomers(): CustomerUser[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a customer is registered
 */
export function isCustomerRegistered(email: string): boolean {
  const customers = getRegisteredCustomers();
  return customers.some((c) => c.email.toLowerCase().trim() === email.toLowerCase().trim());
}

/**
 * Customer Login
 * STRICT RULE: "without register denied login"
 * If user has not registered, login MUST be denied.
 */
export function customerLogin(
  email: string,
  _password?: string
): { success: boolean; user?: CustomerUser; error?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const customers = getRegisteredCustomers();
  const matchedUser = customers.find((c) => c.email.toLowerCase().trim() === cleanEmail);

  if (!matchedUser) {
    return {
      success: false,
      error: 'Access Denied: No account found with this email. You must register an account first before logging in.',
    };
  }

  // Save active session
  try {
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(matchedUser));
  } catch (err) {
    console.error('Failed to save customer session', err);
  }

  return { success: true, user: matchedUser };
}

/**
 * Customer Registration
 * Allows registering a new customer account, enabling subsequent logins.
 */
export function customerRegister(params: {
  name: string;
  email: string;
  phone: string;
  city?: string;
  address?: string;
  country?: string;
  password?: string;
}): { success: boolean; user?: CustomerUser; error?: string } {
  const cleanEmail = params.email.toLowerCase().trim();

  if (isCustomerRegistered(cleanEmail)) {
    return {
      success: false,
      error: 'An account with this email is already registered. Please proceed to login.',
    };
  }

  const newUser: CustomerUser = {
    id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim(),
    email: cleanEmail,
    phone: params.phone.trim(),
    city: params.city?.trim() || '',
    address: params.address?.trim() || '',
    country: params.country?.trim() || 'United States',
    registeredAt: new Date().toISOString(),
  };

  const customers = getRegisteredCustomers();
  customers.push(newUser);

  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(newUser));
  } catch (err) {
    console.error('Failed to save new customer', err);
  }

  return { success: true, user: newUser };
}

/**
 * Get active customer session
 */
export function getActiveCustomer(): CustomerUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Customer Logout
 */
export function customerLogout(): void {
  try {
    localStorage.removeItem(CURRENT_CUSTOMER_KEY);
  } catch (err) {
    console.error('Failed to clear customer session', err);
  }
}

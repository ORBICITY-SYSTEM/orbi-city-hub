/**
 * Firebase Configuration for ORBI City Hub
 * 
 * Architecture: Google Workspace + Firebase + Gemini AI
 * - Firebase Firestore: Real-time database for chat messages, notifications
 * - Firebase Auth: Google Workspace authentication
 * - N8N: Webhook processing and AI workflows
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, updateDoc, doc, Timestamp, where, getDocs } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration for orbi-city-hub-45938897
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForDevelopment",
  authDomain: "orbi-city-hub-45938897.firebaseapp.com",
  projectId: "orbi-city-hub-45938897",
  storageBucket: "orbi-city-hub-45938897.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Google Auth Provider for Workspace
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'orbicitybatumi.com' // Restrict to Google Workspace domain
});

// ============================================
// FIRESTORE COLLECTIONS
// ============================================

// Tawk.to Messages Collection
export const tawkMessagesCollection = collection(db, 'tawk_messages');

// AI Responses Collection
export const aiResponsesCollection = collection(db, 'ai_responses');

// Notifications Collection
export const notificationsCollection = collection(db, 'notifications');

// Activity Log Collection
export const activityLogCollection = collection(db, 'activity_log');

// ============================================
// TAWK.TO MESSAGES - REAL-TIME LISTENERS
// ============================================

export interface TawkMessage {
  id?: string;
  visitor_id: string;
  visitor_name: string;
  visitor_email?: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  responded: boolean;
  chat_id: string;
  agent_response?: string;
}

/**
 * Subscribe to real-time Tawk.to messages
 * Updates automatically when N8N writes new messages to Firestore
 */
export function subscribeTawkMessages(
  callback: (messages: TawkMessage[]) => void,
  limitCount: number = 50
) {
  const q = query(
    tawkMessagesCollection,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: TawkMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as TawkMessage);
    });
    callback(messages);
  });
}

/**
 * Get unread message count for notification badge
 */
export function subscribeUnreadCount(callback: (count: number) => void) {
  const q = query(
    tawkMessagesCollection,
    where('read', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Mark message as read
 */
export async function markMessageRead(messageId: string) {
  const messageRef = doc(db, 'tawk_messages', messageId);
  await updateDoc(messageRef, { read: true });
}

/**
 * Mark message as responded
 */
export async function markMessageResponded(messageId: string, response: string) {
  const messageRef = doc(db, 'tawk_messages', messageId);
  await updateDoc(messageRef, { 
    responded: true,
    agent_response: response,
    responded_at: Timestamp.now()
  });
}

// ============================================
// NOTIFICATIONS - REAL-TIME
// ============================================

export interface Notification {
  id?: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'review';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: Timestamp;
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    notificationsCollection,
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    callback(notifications);
  });
}

/**
 * Add a new notification
 */
export async function addNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
  return addDoc(notificationsCollection, {
    ...notification,
    created_at: Timestamp.now()
  });
}

// ============================================
// AI RESPONSES - FOR REVIEW MANAGEMENT
// ============================================

export interface AIResponse {
  id?: string;
  review_id: string;
  platform: 'google' | 'booking' | 'airbnb' | 'tripadvisor';
  original_text: string;
  ai_response: string;
  status: 'pending' | 'approved' | 'rejected' | 'posted';
  approved_at?: Timestamp;
  posted_at?: Timestamp;
  created_at: Timestamp;
}

/**
 * Subscribe to pending AI responses
 */
export function subscribePendingAIResponses(callback: (responses: AIResponse[]) => void) {
  const q = query(
    aiResponsesCollection,
    where('status', '==', 'pending'),
    orderBy('created_at', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const responses: AIResponse[] = [];
    snapshot.forEach((doc) => {
      responses.push({ id: doc.id, ...doc.data() } as AIResponse);
    });
    callback(responses);
  });
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Sign in with Google Workspace
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function firebaseSignOut() {
  return signOut(auth);
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

// ============================================
// ACTIVITY LOG
// ============================================

export interface ActivityLogEntry {
  id?: string;
  action: string;
  module: string;
  user_id: string;
  user_name: string;
  details: string;
  timestamp: Timestamp;
}

/**
 * Log activity to Firebase
 */
export async function logActivity(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) {
  return addDoc(activityLogCollection, {
    ...entry,
    timestamp: Timestamp.now()
  });
}

/**
 * Subscribe to recent activity
 */
export function subscribeActivityLog(
  callback: (entries: ActivityLogEntry[]) => void,
  limitCount: number = 50
) {
  const q = query(
    activityLogCollection,
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const entries: ActivityLogEntry[] = [];
    snapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() } as ActivityLogEntry);
    });
    callback(entries);
  });
}

export default app;

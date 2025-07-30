import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase Configuration for FCM
export const firebaseConfig = {
  apiKey: "AIzaSyBPE9kaWcLofrUh_dT_pswPDNkEhVtSBjU",
  authDomain: "progresspulse-5c1c9.firebaseapp.com",
  projectId: "progresspulse-5c1c9",
  storageBucket: "progresspulse-5c1c9.firebasestorage.app",
  messagingSenderId: "1020367919471",
  appId: "1:1020367919471:web:245125af8144bac9e3b09a"
};

// VAPID Key for push notifications (Web only)
export const vapidKey = "BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqIUHI80NqI";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export app for use in other modules
export { app };

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

// Check if messaging is supported (web environment)
export const initializeMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return messaging;
    }
    return null;
  } catch (error) {
    console.log('Firebase messaging not supported:', error);
    return null;
  }
};

export { messaging, getToken, onMessage };
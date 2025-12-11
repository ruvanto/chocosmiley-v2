'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getClientMessaging } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function AdminNotificationSubscriber() {
  const { toast } = useToast();

  useEffect(() => {
    const setupAdminNotifications = async () => {
      try {
        if (!('Notification' in window)) return;

        // 1. Register Service Worker
        let registration;
        try {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        } catch (err) {
          console.error('Service Worker registration failed', err);
          return;
        }

        // 2. Initialize Messaging
        const msg = await getClientMessaging();
        if (!msg) return;

        // 3. Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // 4. Get & Save Token
        const token = await getToken(msg, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          const db = getClientFirestore();
          if (db) {
            await setDoc(doc(db, 'notifications', 'admin'), {
              token: token,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }

        // 👇 NEW: Listen for messages when the app is OPEN (Foreground)
        onMessage(msg, (payload) => {
          console.log('[Foreground] Message received: ', payload);
          
          // Option A: Show a Toast inside the app
          toast({
            title: payload.notification?.title || 'New Order',
            description: payload.notification?.body,
            variant: 'default',
            duration: 5000,
          });

          // Option B: FORCE a System Notification even if app is open
          if (Notification.permission === 'granted') {
             new Notification(payload.notification?.title || 'New Order', {
               body: payload.notification?.body,
               icon: payload.notification?.icon
             });
          }
        });

      } catch (error) {
        console.error('Auto-subscribe failed:', error);
      }
    };

    setupAdminNotifications();
  }, [toast]);

  return null;
}
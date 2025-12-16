'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getClientMessaging } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getClientFirestore } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { subscribeToAdminTopic } from '@/app/actions';

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
          await subscribeToAdminTopic(token); 
          console.log("Subscribed to Admin Alerts");
        }

      } catch (error) {
        console.error('Auto-subscribe failed:', error);
      }
    };

    setupAdminNotifications();
  }, [toast]);

  return null;
}
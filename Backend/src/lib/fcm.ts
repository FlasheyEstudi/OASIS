import * as admin from 'firebase-admin';
import { db } from './db';
import logger from './logger';

// Initialize Firebase Admin (Singleton)
function initFirebase() {
  if (admin.apps.length > 0) return admin.app();

  try {
    // Attempt to load from env variable containing stringified JSON, or fallback
    // In production, you would set FIREBASE_SERVICE_ACCOUNT_KEY env variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (error) {
        logger.error({ error }, 'FCM: Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Check your environment variables.');
        return;
      }
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      logger.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not provided. FCM notifications will be mocked.');
      return null;
    }
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize Firebase Admin');
    return null;
  }
}

const firebaseApp = initFirebase();

/**
 * Send a Push Notification to a user via Firebase Cloud Messaging
 * @param userId User ID to send the notification to
 * @param title Title of the notification
 * @param body Body of the notification
 * @param data Optional payload data
 */
export async function sendPushNotification(userId: string, title: string, body: string, data: Record<string, string> = {}) {
  try {
    // 1. Get the user's FCM token from DB
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true }
    });

    const token = user?.fcmToken;

    if (!token) {
      console.log(`[FCM] Skip sending to ${userId}: No FCM token registered.`);
      return false;
    }

    // 2. If firebaseApp is null (missing credentials in DEV), mock it
    if (!firebaseApp) {
      console.log(`[FCM MOCK] Sending push to ${userId} (Token: ${token.substring(0, 8)}...): ${title} - ${body}`);
      return true;
    }

    // 3. Send real notification via Firebase Admin
    const message = {
      notification: { title, body },
      data,
      token
    };

    const response = await admin.messaging().send(message);
    console.log(`[FCM] Successfully sent push to ${userId}: ${response}`);
    return true;

  } catch (error) {
    console.error(`[FCM ERROR] Failed to send push to ${userId}:`, error);
    
    // Check if error is due to an expired/invalid token to clean it up
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as any).code;
      if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
        console.log(`[FCM] Cleaning up invalid token for user ${userId}`);
        await db.user.update({
          where: { id: userId },
          data: { fcmToken: null }
        });
      }
    }
    
    return false;
  }
}

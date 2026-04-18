import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/src/lib/supabase/client';

// We import these only when needed or guard them to prevent SSR crashes
let Notifications: any;
let Device: any;

if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  /** Configuration for how notifications should behave when the app is foregrounded. */
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Registers the device for push notifications and saves the token to Supabase for the given user. */
export async function registerForPushNotificationsAsync(userId: string) {
  if (Platform.OS === 'web' || !Device || !Device.isDevice) {
    console.warn('Push notifications are only supported on physical Android/iOS devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  // Get the token
  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData.data;

    if (token) {
      await saveTokenToDb(userId, token);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#67BB28',
      });
    }

    return token;
  } catch (error) {
    console.error('Error getting expo push token:', error);
    return null;
  }
}

/** Check the current permission status. */
export async function getNotificationPermissionStatus() {
  if (Platform.OS === 'web') return 'granted'; // Prevent modal on web
  if (!Notifications) return 'undetermined';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Save or update the push token in the database. */
async function saveTokenToDb(userId: string, token: string) {
  const sb = supabase as any;
  const { error } = await sb.from('push_tokens').upsert(
    {
      user_id: userId,
      token: token,
      device_type: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' }
  );

  if (error) {
    console.error('Error saving push token to DB:', error);
  }
}

/** Call the Expo Push API to send notifications. */
export async function sendPushNotification(expoPushTokens: string[], title: string, body: string, data?: any) {
  const message = expoPushTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    data: data || {},
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/** Get all tokens for a broadcast or specific user. */
export async function getTargetPushTokens(userId?: string | null): Promise<string[]> {
  const sb = supabase as any;
  let query = sb.from('push_tokens').select('token');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching push tokens:', error);
    return [];
  }

  return (data as any[]).map((item) => item.token);
}

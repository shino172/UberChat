// src/utils/notifications.ts
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

const configureNotifications = () => {
  PushNotification.configure({
    onNotification: (notification) => {
      console.log('NOTIFICATION:', notification);
    },
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'default_channel_id',
      channelName: 'Default Channel',
      channelDescription: 'A default channel for notifications',
      soundName: 'default',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
  );
};

const showNotification = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: 'default_channel_id',
    title,
    message,
    playSound: true,
    soundName: 'default',
    vibrate: true,
  });
};

export { configureNotifications, showNotification };
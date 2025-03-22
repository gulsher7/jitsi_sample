import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { handleTestCall } from "./callingHandle";

/**
 * Requests the necessary user permissions for receiving notifications.
 * Handles permission requests based on the platform (Android or iOS).
 */
export async function requestUserPermission() {
  if (Platform.OS === "android" && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      getFCMToken();
    } else {
      console.log("permission denied");
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFCMToken();
    }
  }
}

/**
 * Fetches and stores the FCM token if not already stored.
 * Registers the device for remote messages if needed.
 */
const getFCMToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();

    let fcmToken = await AsyncStorage.getItem("fcm_token");
    // Alert.alert("fcmToken", fcmToken);  
    if (fcmToken) {
      console.log("old token", fcmToken);
      notificationListeners()
    } else {
      const token = await messaging().getToken();
      await AsyncStorage.setItem("fcm_token", token);
      console.log("new token", token);
      notificationListeners()
    }
  } catch (error) {
    console.log("error during generating token", error);
  }
};


/**
 * Listens to incoming FCM messages and navigates accordingly.
 * Sets up notification listeners for various app states (foreground, background, quit).
 * @returns {Function} unsubscribe function to remove listeners
 */
export async function notificationListeners() {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {


    if (!!remoteMessage?.data) {
      console.log("Notification received in foreground:", remoteMessage.notification);

      // Check if it's a call notification

      handleTestCall(remoteMessage.notification, remoteMessage.data);
    }
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {

    // if (remoteMessage.notification) {
    //   console.log("Notification caused app to open from background state:", remoteMessage.notification);

    //   // Check if it's a call notification
    //   if (remoteMessage.data && remoteMessage.data.type === 'call') {
    //     handleTestCall(remoteMessage.notification, remoteMessage.data);
    //   }
    // } 
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log(
          "Notification caused app to open from quit state:",
          remoteMessage.notification
        );

      }
    });

  return unsubscribe;
}

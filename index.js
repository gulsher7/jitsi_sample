/**
 * @format
 */

import {AppRegistry} from 'react-native';
import 'react-native-callkeep';
import App from './App';
import {name as appName} from './app.json';
import messaging from "@react-native-firebase/messaging";
import { handleTestCall } from './src/utils/callingHandle';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  handleTestCall(remoteMessage.notification, remoteMessage.data);
});



AppRegistry.registerComponent(appName, () => App);

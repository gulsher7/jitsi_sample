import React, { useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './src/components/Home';
import Meeting from './src/components/Meeting';
import { requestUserPermission } from './src/utils/notificationServices';
import ChatList from './src/components/ChatList';
import ChatMessage from './src/components/ChatMessage';
// Define global type for TypeScript
declare global {
  var currentCall: {
    callUUID: string;
    roomName: string;
    callerId: string;
    callerName: string;
  } | null;
}

const RootStack = createStackNavigator();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);


  useEffect(() => {
    // Configure CallKeep

    const options = {
      ios: {
        appName: 'Jitsi Meet',
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        selfManaged: false,
        foregroundService: {
          channelId: 'jitsi.com.app',
          channelName: 'Foreground service for video calls',
          notificationTitle: 'Call service running',
          notificationIcon: 'phone_account',
        },
        additionalPermissions: []
      },
    };

    // Setup CallKeep
    RNCallKeep.setup(options);

    if (Platform.OS === "android") {
      RNCallKeep.setAvailable(true);
    }


    // Handle call actions
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
      // Delay app activation to allow background-to-foreground transition

      // Now handle the call and navigation
      if (global.currentCall && global.currentCall.callUUID === callUUID) {
        RNCallKeep.setCurrentCallActive(callUUID);

        if (navigationRef.current) {
          navigationRef.current.navigate('Meeting', {
            url: `https://meet.jit.si/${global.currentCall.roomName}`,
            subject: `Call with ${global.currentCall.callerName}`,
            audioOnly: false
          });
        }

        if (Platform.OS === 'android') {
          RNCallKeep.backToForeground();
        }

        setTimeout(() => {
          RNCallKeep.endCall(callUUID);
        }, 2000);
      }

    });

    RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
      // Call was rejected or ended
      console.log('Call ended or rejected', callUUID);
    });


    requestUserPermission();

    return () => {
      // Clean up event listeners
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
    }; 
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator initialRouteName="Home">

        <RootStack.Screen
          component={ChatList}
          name="ChatList"
          options={{
            headerShown: false,
          }}
        />

        <RootStack.Screen
          component={ChatMessage}
          name="ChatMessage"
          options={{
            headerShown: false,
          }}
        />


        <RootStack.Screen
          component={Home}
          name="Home"
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          component={Meeting}
          name="Meeting"
          options={{
            headerShown: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Meeting from './components/Meeting';
import ChatList from './components/ChatList';
import ChatMessage from './components/ChatMessage';
import { setNavigationRef } from './utils/callingHandle';
import { requestUserPermission } from './utils/notificationServices';
import RNCallKeep from 'react-native-callkeep';
const RootStack = createStackNavigator();


// Define global type for TypeScript
declare global {
  var currentCall: {
    callUUID: string;
    roomName: string;
    callerId: string;
    callerName: string;
  } | null;
}

const Routes = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);



  return (
    <NavigationContainer
      ref={navigationRef}
    >
      <RootStack.Navigator initialRouteName="ChatList">

      <RootStack.Screen
          component={ChatList}
          name="ChatList"
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
      
        <RootStack.Screen
          component={ChatMessage}
          name="ChatMessage"
          options={{
            headerShown: false,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
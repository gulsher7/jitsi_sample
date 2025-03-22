import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Meeting from './components/Meeting';
import ChatList from './components/ChatList';
import ChatMessage from './components/ChatMessage';

const RootStack = createStackNavigator();

const Routes = () => (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="ChatList">
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
      </RootStack.Navigator>
    </NavigationContainer>
);

export default Routes;
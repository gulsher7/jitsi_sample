//import liraries
import React, { useEffect } from 'react';
import Routes from './src/Routes';
import { View } from 'react-native';
import { requestUserPermission } from './src/utils/notificationServices';   
// create a component
const App = () => {

  useEffect(() => {
    requestUserPermission();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Routes />
    </View>
  )
};


export default App;

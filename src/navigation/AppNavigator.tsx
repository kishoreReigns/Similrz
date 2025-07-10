import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import StartupPage from '../screens/StartupPage';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Startup">
      <Stack.Screen name="Startup" component={StartupPage} options={{ title: 'Welcome' }} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Signup" component={SignupPage} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

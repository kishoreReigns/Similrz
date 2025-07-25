import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import StartupPage from '../screens/StartupPage';
import LoginPage from '../screens/LoginPage';
import SignupPage from '../screens/SignupPage';
import HomePage from '../screens/HomePage';
import ProfilePage from '../screens/ProfilePage';
import StoryPage from '../screens/StoryPage';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Startup">
      <Stack.Screen name="Startup" component={StartupPage} options={{ title: 'Welcome' }} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Signup" component={SignupPage} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
      <Stack.Screen name="StoryPage" component={StoryPage} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import VideoDetailsScreen from '../screens/VideoDetailsScreen';
import VideoCreateScreen from '../screens/VideoCreateScreen';
import VideoEditScreen from '../screens/VideoEditScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator handles the navigation structure of the application
 */
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="VideoDetails" component={VideoDetailsScreen} />
        <Stack.Screen name="VideoCreate" component={VideoCreateScreen} />
        <Stack.Screen name="VideoEdit" component={VideoEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 
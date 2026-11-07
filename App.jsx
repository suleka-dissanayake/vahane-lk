import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import AuthScreen from './src/screens/AuthScreen';
import PostAdScreen from './src/screens/PostAdScreen';
import InspectionFormScreen from './src/screens/InspectionFormScreen';
import MyAdsScreen from './src/screens/MyAdsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PriceGuideScreen from './src/screens/PriceGuideScreen';
import ModelDetailScreen from './src/screens/ModelDetailScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { ready } = useAuth();
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1d3557" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Vehicle Ad' }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Account' }} />
        <Stack.Screen name="PostAd" component={PostAdScreen} options={{ title: 'Post an Ad' }} />
        <Stack.Screen name="InspectionForm" component={InspectionFormScreen} options={{ title: 'Inspection Report' }} />
        <Stack.Screen name="MyAds" component={MyAdsScreen} options={{ title: 'My Ads' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="PriceGuide" component={PriceGuideScreen} options={{ title: 'Price Guide' }} />
        <Stack.Screen name="ModelDetail" component={ModelDetailScreen} options={{ title: 'Model Overview' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

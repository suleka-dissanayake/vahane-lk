import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ValuationSearchScreen from './src/screens/ValuationSearchScreen';
import ModelDetailScreen from './src/screens/ModelDetailScreen';
import InspectionScreen from './src/screens/InspectionScreen';
import SavedReportsScreen from './src/screens/SavedReportsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Vahane.lk' }} />
        <Stack.Screen name="ValuationSearch" component={ValuationSearchScreen} options={{ title: 'Car Directory' }} />
        <Stack.Screen name="ModelDetail" component={ModelDetailScreen} options={{ title: 'Vehicle Overview' }} />
        <Stack.Screen name="Inspection" component={InspectionScreen} options={{ title: 'Live Inspection' }} />
        <Stack.Screen name="SavedReports" component={SavedReportsScreen} options={{ title: 'Saved Reports' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import VendorHomeScreen from '../screens/VendorHomeScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {AppIcon, AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import DrawerContainer from '../components/DrawerContainer';

const Stack = createStackNavigator();

// login stack
const LoginStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      headerShown: false
    }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen}/>
    <Stack.Screen name="Login" component={LoginScreen}/>
    <Stack.Screen name="Signup" component={SignupScreen}/>
    
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false
    }}>
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      style={styles.homeHeader}
    />
    <Stack.Screen name="Home" component={HomeScreen}/>
  </Stack.Navigator>
);

const VendorStack = () => (
  <Stack.Navigator
    initialRouteName="VendorHome"
    screenOptions={{
      headerShown: false
    }}>
    <Stack.Screen name="VendorHome" component={VendorHomeScreen}/>
    <Stack.Screen name="AddVehicle" component={AddVehicleScreen}/>
  </Stack.Navigator>
);

// BOTTOM TAB BAR ON THE HOME SCREEN
      // it's an imported react component, so styling is different: https://reactnavigation.org/docs/bottom-tab-navigator/
const BottomTab = createBottomTabNavigator();
const TabNavigator = () => (
  <BottomTab.Navigator
    initialRouteName="Home"
    screenOptions={{
      tabBarStyle: {
        backgroundColor:'black',
    
      },
      tabBarInactiveTintColor: 'lightgrey',
      tabBarActiveTintColor: AppStyles.color.tint,
      headerShown: false,
    }}>
    <BottomTab.Screen
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : 'lightgrey',}}
              source={AppIcon.images.home}
            />
          );
        },
      }}
      name="HomeStack"
      component={HomeStack}
      
    />
    <BottomTab.Screen
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : 'lightgrey', height:25, width:25}}
              source={AppIcon.images.defaultUser}
            />
          );
        },
      }}
      name="ProfileScreen"
      component={ProfileScreen}
    />

  </BottomTab.Navigator>
);

// drawer stack
const Drawer = createDrawerNavigator();
const DrawerStack = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerStyle: {outerWidth: 200},
      drawerPosition: 'left',
      headerShown: false,
    }}
    drawerContent={({navigation}) => (
      <DrawerContainer navigation={navigation} />
    )}>
    <Drawer.Screen name="Tab" component={TabNavigator} />
  </Drawer.Navigator>
);

// Manifest of possible screens
const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="LoginStack"
    screenOptions={{headerShown: false}}>
    <Stack.Screen name="LoginStack" component={LoginStack} />
    <Stack.Screen name="VendorStack" component={VendorStack} />
    <Stack.Screen name="DrawerStack" component={DrawerStack} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
);

const styles = StyleSheet.create({
  homeHeader:{
    backgroundColor: AppStyles.color.primarybg,
  },
  headerTitleStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    color: 'black',
  },
  iconStyle: {
    tintColor: AppStyles.color.tint, 
    width: 30, 
    height: 30
  },
});

export default AppNavigator;

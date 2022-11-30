import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, useRoute} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import VendorHomeScreen from '../screens/VendorHomeScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import MessageScreen from '../screens/MessageScreen';
import Conversation from '../components/Conversation';
import ListingScreen from '../screens/ListingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {AppIcon, AppStyles} from '../AppStyles';
import DrawerContainer from '../components/DrawerContainer';

const Stack = createStackNavigator();

const homeIcon = require('../../assets/icons/home-icon.png')
const profileIcon = require('../../assets/icons/profile.png')
const messagesIcon = require('../../assets/icons/messages.png')

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

const MessageStack = () => (
  <Stack.Navigator
    initialRouteName="Messages"
    screenOptions={{
      headerShown:false
    }}
  >

    <Stack.Screen
      name="Messages"
      component={MessageScreen}
      style={styles.homeHeader}
      options={({navigation}) => ({
        headerLeft: () => (
          <Pressable onPress={() => navigation.openDrawer()}>
            <Image style={styles.iconStyle} source={AppIcon.images.menu} />
          </Pressable>
        ),
        headerLeftContainerStyle: {paddingLeft: 10},
      })}
    />

    <Stack.Screen
    name="Conversation"
    component={Conversation}
    style={styles.homeHeader}
    />

  </Stack.Navigator>
)

const HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false
    }}>

    <Stack.Screen
      name="Home"
      component={HomeScreen}
      style={styles.homeHeader}
      options={({navigation}) => ({
        headerLeft: () => (
          <Pressable onPress={() => navigation.openDrawer()}>
            <Image style={styles.iconStyle} source={AppIcon.images.menu} />
          </Pressable>
        ),
        headerLeftContainerStyle: {paddingLeft: 10},
      })}
    />

    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      style={styles.homeHeader}
    />

    <Stack.Screen
      name="Listing"
      component={ListingScreen}
      style={styles.homeHeader}
    />

  </Stack.Navigator>
);

const VendorStack = () => (
  <Stack.Navigator
    initialRouteName="VendorHome"
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="VendorHome" component={VendorHomeScreen}/>
    <Stack.Screen 
      name="AddVehicle" 
      component={AddVehicleScreen} 
      options={{ tabBarVisible: false }}
    />

    <Stack.Screen
      name="Messages"
      component={MessageScreen}
      style={styles.homeHeader}
      options={{headerShown:false}}
    />

    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      style={styles.homeHeader}
    />

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
        backgroundColor: AppStyles.color.primarybg,
        borderTopColor: AppStyles.color.secondarybg,
        paddingBottom: 16,
        borderTopWidth: 2,
        height: '10%',
      },
      tabBarInactiveTintColor: AppStyles.color.text,
      tabBarActiveTintColor: AppStyles.color.tint,
      headerShown: false,
      tabBarShowLabel: false
    }}>

    <BottomTab.Screen
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, height:25, width:25}}
              source={homeIcon}
            />
          );
        },
      }}
      name="HomeStack"
      component={HomeStack}
    />

    <BottomTab.Screen
      options={{
        tabBarLabel:'Messages',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, height: 25, width: 25}}
              source={messagesIcon}
            />
          );
        },
      }}
      name="MessageStack"
      component={MessageStack}
    />

    <BottomTab.Screen
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, width:20, height: 25}}
              source={profileIcon}
            />
          );
        },
      }}
      name="ProfileScreen"
      component={ProfileScreen}
    />

  </BottomTab.Navigator>
);

const VendorBottomTab = createBottomTabNavigator();
const VendorTabNavigator = () => (
  <VendorBottomTab.Navigator
    initialRouteName="Home"
    screenOptions={{
      tabBarStyle: {
        backgroundColor: AppStyles.color.primarybg,
        borderTopColor: AppStyles.color.secondarybg,
        paddingBottom: 16,
        borderTopWidth: 2,
        height: '10%',
        display: useRoute().name == "AddVehicle" ? 'none' : 'flex' // TODO: get bottom tab bar to hide when on the AddVehicle page
      },
      tabBarInactiveTintColor: AppStyles.color.text,
      tabBarActiveTintColor: AppStyles.color.tint,
      headerShown: false,
      tabBarShowLabel: false
    }}>

    <VendorBottomTab.Screen
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, height:25, width:25}}
              source={homeIcon}
            />
          );
        },
      }}
      name="VendorStack"
      component={VendorStack}
    />

    <VendorBottomTab.Screen
      options={{
        tabBarLabel:'Messages',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, height: 25, width: 25}}
              source={messagesIcon}
            />
          );
        },
      }}
      name="MessageStack"
      component={MessageStack}
    />

    <VendorBottomTab.Screen
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({focused}) => {
          return (
            <Image
              style={{ tintColor: focused ? AppStyles.color.tint : AppStyles.color.text, width:20, height: 25}}
              source={profileIcon}
            />
          );
        },
      }}
      name="ProfileScreen"
      component={ProfileScreen}
    />

  </VendorBottomTab.Navigator>
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

const VendorDrawer = createDrawerNavigator();
const VendorDrawerStack = () => (
  <VendorDrawer.Navigator
    screenOptions={{
      drawerStyle: {outerWidth: 200},
      drawerPosition: 'left',
      headerShown: false,
    }}
    drawerContent={({navigation}) => (
      <DrawerContainer navigation={navigation} />
    )}>
    <VendorDrawer.Screen name="Tab" component={VendorTabNavigator} />
  </VendorDrawer.Navigator>
);

// Manifest of possible screens
const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="LoginStack"
    screenOptions={{headerShown: false}}>
    <Stack.Screen name="LoginStack" component={LoginStack} />
    <Stack.Screen name="VendorStack" component={VendorDrawerStack} />
    <Stack.Screen name="DrawerStack" component={DrawerStack} />
    <Stack.Screen name="MessageStack" component={MessageStack}/>
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

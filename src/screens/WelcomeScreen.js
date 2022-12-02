import React, {useEffect, useState} from 'react';
import Button from 'react-native-button';
import {ActivityIndicator, Text, View, StyleSheet, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useDispatch} from 'react-redux';
import {login} from '../reducers';
import {AppStyles} from '../AppStyles';


function WelcomeScreen({navigation, route}) {
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    // TODO:
    // add a check to see if user previously logged in did not lgo out properly
    // if so, link their data correctly
    tryToLoginFirst();
  }, []);

  async function tryToLoginFirst() {
    console.log("Attempting login")
    const email = await AsyncStorage.getItem('@loggedInUserID:key');
    const password = await AsyncStorage.getItem('@loggedInUserID:password');
    const id = await AsyncStorage.getItem('@loggedInUserID:id');
    if (
      id != null &&
      id.length > 0 &&
      password != null &&
      password.length > 0
    ) {
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          firestore()
            .collection('users')
            .doc(id)
            .get()
            .then(function (doc) {
              var userDict = {
                id: id,
                email: email,
                profileURL: doc.photoURL,
                fullname: doc.data().fullname,
              };
              if (doc.exists) {
                console.log('Logging in as ' + userDict.fullname);
                dispatch(login(userDict));
                navigation.navigate('DrawerStack');
              } else {
                setIsLoading(false);
              }
            })
            .catch(function (error) {
              setIsLoading(false);
              const {code, message} = error;
              Alert.alert(message);
            });
        })
        .catch((error) => {
          const {code, message} = error;
          setIsLoading(false);
          Alert.alert(message);
          // For details of error codes, see the docs
          // The message contains the default Firebase string
          // representation of the error
        });
      return;
    }
    const fbToken = await AsyncStorage.getItem(
      '@loggedInUserID:facebookCredentialAccessToken',
    );
    if (id != null && id.length > 0 && fbToken != null && fbToken.length > 0) {
      const credential = firebase.auth.FacebookAuthProvider.credential(fbToken);
      auth()
        .signInWithCredential(credential)
        .then((result) => {
          var user = result.user;
          var userDict = {
            id: user.uid,
            fullname: user.displayName,
            email: user.email,
            profileURL: user.photoURL,
          };
          dispatch(login(userDict));
          navigation.navigate('DrawerStack');
        })
        .catch((error) => {
          setIsLoading(false);
        });
      return;
    }
    setIsLoading(false);
  }

  if (isLoading == true) {
    return (
      <ActivityIndicator
        style={styles.spinner}
        size="large"
        color={AppStyles.color.tint}
      />
    );
  }
  return (
    <View style={styles.container}>
      {console.log("Entering welcome screen")}
      <Text style={styles.subtitle}>Welcome to</Text>
      <Text style={styles.title}>Scootly</Text>
      <Button
        containerStyle={styles.loginContainer}
        style={styles.loginText}
        onPress={() => navigation.navigate('Login')}>
        Log In
      </Button>
      <Button
        containerStyle={styles.signupContainer}
        style={styles.signupText}
        onPress={() => navigation.navigate('Signup')}>
        Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppStyles.color.primarybg,
    paddingBottom: 60,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: AppStyles.fontSize.mainTitle,
    fontFamily: AppStyles.fontFamily.bold,
    color: AppStyles.color.white,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  subtitle: {
    fontSize: AppStyles.fontSize.small,
    fontFamily: AppStyles.fontFamily.bold,
    color: AppStyles.color.secondarytext,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  loginContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.accent,
    borderRadius: AppStyles.borderRadius.main,
    padding: 15,
    marginTop: 30,
  },
  loginText: {
    color: AppStyles.color.primarybg,
    fontFamily: AppStyles.fontFamily.regular,
  },
  signupContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.primarybg,
    borderRadius: AppStyles.borderRadius.main,
    padding: 15,
    borderWidth: 1,
    borderColor: AppStyles.color.white,
    marginTop: 15,
  },
  signupText: {
    color: AppStyles.color.white,
    fontFamily: AppStyles.fontFamily.regular,
  },
  spinner: {
    marginTop: 200,
  },
});

export default WelcomeScreen;

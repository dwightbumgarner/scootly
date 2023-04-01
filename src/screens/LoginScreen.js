import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import Button from 'react-native-button';
import {AppStyles} from '../AppStyles';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
const FBSDK = require('react-native-fbsdk');
const {LoginManager, AccessToken} = FBSDK;
import {login} from '../reducers';
import { Icon } from 'react-native-elements';
import { SocialIcon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
// import { FontAwesome } from '@expo/vector-icons/FontAwesome';
// import { Icon } from 'react-native-vector-icons/dist/FontAwesome';



function LoginScreen({navigation}) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '176790331793-nl45oq9u5uoedgu0r3rp0lub7224ituk.apps.googleusercontent.com',
    });
  }, []);

  const onPressLogin = () => {
    if (email.length <= 0 || password.length <= 0) {
      Alert.alert('Please enter your email and password');
      return;
    }
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        const user_uid = response.user._user.uid;
        firestore()
          .collection('users')
          .doc(user_uid)
          .get()
          .then(function (user) {
            if (user.exists) {
              AsyncStorage.setItem('@loggedInUserID:id', user_uid);
              AsyncStorage.setItem('@loggedInUserID:key', email);
              AsyncStorage.setItem('@loggedInUserID:password', password);
              dispatch(login(user.data()));
              navigation.navigate('DrawerStack');
            } else {
              Alert.alert('User does not exist. Please try again.');
            }
          })
          .catch(function (error) {
            const {message} = error;
            Alert.alert(message);
          });
      })
      .catch((error) => {
        const {message} = error;
        Alert.alert(message);
        // For details of error codes, see the docs
        // The message contains the default Firebase string
        // representation of the error
      });
  };

  const onPressGoogle = () => {
    setLoading(true);
    GoogleSignin.signIn()
      .then((data) => {
        console.log('data', data);
        // Create a new Firebase credential with the token
        const credential = firebase.auth.GoogleAuthProvider.credential(
          data.idToken,
        );
        // Login with the credential
        const accessToken = data.idToken;
        AsyncStorage.setItem(
          '@loggedInUserID:googleCredentialAccessToken',
          accessToken,
        );
        return auth().signInWithCredential(credential);
      })
      .then((result) => {
        setLoading(false);
        var user = result.user;
        AsyncStorage.setItem('@loggedInUserID:id', user.uid);
        var userDict = {
          id: user.uid,
          fullname: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        var data = {
          ...userDict,
          appIdentifier: 'rn-android-universal-listings',
        };
        console.log('data', data);
        firestore().collection('users').doc(user.uid).set(data);
        dispatch(login(userDict));
        navigation.navigate('DrawerStack', {
          user: userDict,
        });
      })
      .catch((error) => {
        const {message} = error;
        setLoading(false);
        Alert.alert(message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={{
            paddingHorizontal: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
          <Icon style={styles.backArrow} type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => navigation.navigate('Welcome')}></Icon>
          <Text style={styles.title}>Welcome Back!</Text>
      </View>
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          placeholder="E-mail or phone number"
          onChangeText={setEmail}
          value={email}
          placeholderTextColor={AppStyles.color.white}
          underlineColorAndroid="transparent"
        />
      </View>
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          placeholderTextColor={AppStyles.color.white}
          underlineColorAndroid="transparent"
        />
      </View>
      <Button
        containerStyle={styles.loginContainer}
        style={styles.loginText}
        onPress={() => onPressLogin()}>
        Log In
      </Button>
      <Text style={styles.or}>OR</Text>
      {loading ? (
        <ActivityIndicator
          style={{marginTop: 30}}
          size="large"
          animating={loading}
          color={AppStyles.color.tint}
        />
      ) : (
        <TouchableOpacity
          onPress={onPressGoogle}
          containerStyle={styles.googleContainer}
          style={styles.Button}>
          <View style={{
            justifyContent: "flex-start",
            flexDirection: "row",
          }}>
            <View>
              <SocialIcon
              title='Sign in with google'
              type='google'
              iconStyle={{color: AppStyles.color.primarybg}}
              iconSize={20}
              light={true}
              />
            </View>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.color.primarybg,
    alignItems: 'center',
  },
  or: {
    color: AppStyles.color.accent,
    fontFamily: AppStyles.fontFamily.bold,
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    paddingTop: 80,
    fontSize: AppStyles.fontSize.title,
    fontFamily: AppStyles.fontFamily.bold,
    color: AppStyles.color.white,
    marginBottom: 100,
    alignItems: 'auto',
    paddingRight: 65
  },
  backArrow: {
    marginRight: 50,
    paddingBottom: 20
  },
  content: {
    paddingLeft: 50,
    paddingRight: 50,
    textAlign: 'center',
    fontSize: AppStyles.fontSize.content,
    color: AppStyles.color.text,
  },
  loginContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.accent,
    borderRadius: AppStyles.borderRadius.main,
    padding: 15,
    marginTop: 30,
  },
  loginText: {
    color: AppStyles.color.loginText,
    fontFamily: AppStyles.fontFamily.regular,
  },
  placeholder: {
    color: 'red',
  },
  InputContainer: {
    width: AppStyles.textInputWidth.main,
    marginTop: 30,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: AppStyles.color.white,
    borderRadius: AppStyles.borderRadius.main,
  },
  body: {
    height: 50,
    paddingLeft: 20,
    paddingRight: 20,
    color: AppStyles.color.text,
    fontFamily: AppStyles.fontFamily.regular
  },
  googleContainer: {
    width: 250,
    height: 65,
    marginTop: 30,
    backgroundColor: AppStyles.color.text,
    borderRadius: 30
  },
  googleText: {
    color: AppStyles.color.loginText,
    fontFamily: AppStyles.fontFamily.regular, 
    fontWeight: '500',
    textAlign: 'center',
    marginLeft: 20,
    marginTop: 25
  },
});

export default LoginScreen;

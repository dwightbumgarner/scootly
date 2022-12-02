import React, { useState, useEffect } from 'react';
import {View, StyleSheet, Text} from 'react-native';
import { connect } from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import RentalListing from '../components/RentalListing';
import { firebase } from '@react-native-firebase/firestore';
function HomeScreen({navigation}) {

  var user = firebase.auth().currentUser;
  const [username, setUsername] = useState(user?.displayName);
  const [modalActive, setModalActive] = useState(false);

  // listen for opening of screen, check for name change
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      user = firebase.auth().currentUser;
      setUsername(user?.displayName);
      console.log("Username: " + user?.displayName);
    })

    return unsubscribe;
  }, [navigation])

  function backgroundHandler(modalState) {
    setModalActive(modalState);
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hi, {username.split(' ').slice(0, -1).join(' ') ?? 'Stranger'}</Text>
        <RentalListing navigation={navigation} handler = {backgroundHandler}/>
        {modalActive &&
        <View style={styles.hidden}>
        </View>}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.color.primarybg,
    padding: Configuration.home.listing_item.offset,
    alignItems: 'center',
  },
  title: {
    paddingTop: 65,
    fontSize: AppStyles.fontSize.title,
    fontFamily: AppStyles.fontFamily.bold,
    color: AppStyles.color.white,
    marginBottom: 40,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
  hidden: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1, // works on ios
    elevation: -1, // works on android
  },
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);

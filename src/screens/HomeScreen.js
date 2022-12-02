import React, { useState, useEffect } from 'react';
import {View, StyleSheet, Text} from 'react-native';
import { connect } from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import RentalListing from '../components/RentalListing';
import { firebase } from '@react-native-firebase/firestore';

function HomeScreen({navigation}) {

  var user = firebase.auth().currentUser;
  const [username, setUsername] = useState(user.displayName);

  // listen for opening of screen, check for name change
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      user = firebase.auth().currentUser;
      setUsername(user.displayName);
      console.log("Username: " + user.displayName);
    })

    return unsubscribe;
  }, [navigation])


  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hi, {username.split(' ').slice(0, -1).join(' ') ?? 'Stranger'}</Text>
        <RentalListing navigation={navigation}/>
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
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);

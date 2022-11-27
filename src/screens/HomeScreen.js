import React, {useLayoutEffect, useState, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import RentalListing from '../components/RentalListing';



function HomeScreen({navigation}) {
  const auth = useSelector((state) => state.auth);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hi, {auth.user?.fullname.split(' ').slice(0, -1).join(' ') ?? 'Stranger'}</Text>
        <RentalListing></RentalListing>
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

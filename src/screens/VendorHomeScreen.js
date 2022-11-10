import React, {useLayoutEffect, useState, useEffect} from 'react';
import Button from 'react-native-button';
import {View, StyleSheet, Text} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import VendorListing from '../components/VendorListing';



function VendorHomeScreen({navigation}) {
  const auth = useSelector((state) => state.auth);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hi, {auth.user?.fullname.split(' ').slice(0, -1).join(' ') ?? 'Stranger'}</Text>
        {<VendorListing></VendorListing>}
        <Button
        containerStyle={styles.addVehicleContainer}
        style={styles.addVehicleText}
        onPress={() => navigation.navigate('AddVehicle')}>
        Add Vehicle
      </Button>
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
  addVehicleContainer: {
    position: 'absolute',
    bottom:50,
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 30,
  },
  addVehicleText: {
    color: AppStyles.color.primarybg,
  },
  title: {
    paddingTop: 80,
    fontSize: AppStyles.fontSize.title,
    fontWeight: 'bold',
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

export default connect(mapStateToProps)(VendorHomeScreen);

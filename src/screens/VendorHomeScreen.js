import React, {useLayoutEffect, useState, useEffect} from 'react';
import Button from 'react-native-button';
import {View, StyleSheet, Text} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import VendorListing from '../components/VendorListing';



function VendorHomeScreen({navigation, refreshKey}) {
  const auth = useSelector((state) => state.auth);
  const [updateKey, setUpdateKey] = useState(0);
  useEffect(() => {
      setUpdateKey(Math.random());
    }, []);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Hi, {auth.user?.fullname.split(' ').slice(0, -1).join(' ') ?? 'Stranger'}</Text>
        {<VendorListing refreshKey={updateKey}></VendorListing>}
        <Button
        containerStyle={styles.addVehicleContainer}
        style={styles.addVehicleText}
        onPress={() => navigation.navigate('AddVehicle')}>
        Add a Vehicle
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
    bottom: 30,
    right: 24,
    backgroundColor: AppStyles.color.accent,
    borderRadius: AppStyles.borderRadius.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 30,
  },
  addVehicleText: {
    color: AppStyles.color.background,
    fontFamily: AppStyles.fontFamily.regular,
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

export default connect(mapStateToProps)(VendorHomeScreen);

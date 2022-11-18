import React, {useLayoutEffect, useState, useEffect} from 'react';
import Button from 'react-native-button';
import {View, StyleSheet, Text, TextInput, Image, TouchableOpacity,} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles} from '../AppStyles';
import {Configuration} from '../Configuration';
import { Icon } from 'react-native-elements'
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';



function AddVehicleScreen({navigation}) {
  const auth = useSelector((state) => state.auth);
  const [vehicleName, setVehicleName] = useState('');

  const selectImage = () => {
    //const result = await launchImageLibrary(options?);
  };

  return (
    <View style={styles.container}>
      <View style={{
            paddingHorizontal: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        }}>
          <Icon style={styles.backArrow} type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => navigation.navigate('VendorHome')}></Icon>
          <Text style={styles.title}>Add a Vehicle</Text>
      </View>
      <TouchableOpacity onPress={()=>selectImage()}>
        <Image
          style={styles.vehicleImage}
          source={{uri: "https://www.cnet.com/a/img/resize/56c9641e775833074b5351cda173e26692502334/hub/2022/03/23/74bb3fd6-bcb7-4ca2-8bd8-7837df3cab03/apollo-city-electric-scooter-02.jpg?auto=webp&fit=crop&height=1200&width=1200"}}
        />
      </TouchableOpacity>
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          placeholder="Vehicle Name"
          onChangeText={setVehicleName}
          value={vehicleName}
          placeholderTextColor={AppStyles.color.white}
          underlineColorAndroid="transparent"
        />
      </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppStyles.color.primarybg,
    alignItems: 'center',
  },
  title: {
    paddingTop: 80,
    fontSize: AppStyles.fontSize.title,
    fontFamily: AppStyles.fontFamily.bold,
    color: AppStyles.color.white,
    marginBottom: 80,
    alignItems: 'auto',
    paddingRight: 80
  },
  backArrow: {
    marginRight: 70,
    paddingBottom: 0
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
    fontFamily: AppStyles.fontFamily.regular,
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
  vehicleImage: {
    width: 240,
    height: 240,
    borderRadius: 24,
    marginBottom: 24
  },
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(AddVehicleScreen);

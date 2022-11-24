import React, {useLayoutEffect, useState, useEffect} from 'react';
import Button from 'react-native-button';
import {View, StyleSheet, Text, TextInput, Image, TouchableOpacity, Alert} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles, AppIcon} from '../AppStyles';
import {Configuration} from '../Configuration';
import { Icon } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';



function AddVehicleScreen({navigation}) {
  const auth = useSelector((state) => state.auth);
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleDescription, setVehicleDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [currentScreen, setCurrentScreen] = useState(true);

  const selectImage = () => {
    const options = {
      maxWidth: 2000,
      maxHeight: 2000,
      storageOptions: {
        skipBackup: true,
        path: 'vehicleImages'
      }
    };
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        console.log(source);
        setImage(source);
      }
    });
  };

  const uploadImage = async () => {
    console.log(image);
    const { uri } = image;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    setUploading(true);
    setTransferred(0);
    const task = storage()
      .ref(filename)
      .putFile(uploadUri);
    // set progress state
    task.on('state_changed', snapshot => {
      setTransferred(
        Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
      );
    });
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    setUploading(false);

    task.snapshot.ref.getDownloadURL().then(downloadURL => {
      //user.updateProfile({ photoURL: downloadURL })
      console.log(downloadURL);
    })
    Alert.alert(
      'Photo uploaded!',
      'Your photo has been uploaded to Firebase Cloud Storage!'
    );
    setImage(null);
  };

  return (
    currentScreen ? 
    (<View style={styles.container}>
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
          source={image ? {uri: (image?.uri)} : (AppIcon.images.defaultVehicle)}
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
      <View style={styles.InputContainer}>
        <TextInput
          style={styles.body}
          placeholder="Description"
          onChangeText={setVehicleDescription}
          value={vehicleName}
          placeholderTextColor={AppStyles.color.white}
          underlineColorAndroid="transparent"
        />
      </View>
      <Button
        containerStyle={styles.addVehicleContainer}
        style={styles.addVehicleText}
        onPress={() => setCurrentScreen(false)}>
        Next
      </Button>
  </View>):
  (<View style={styles.container}>
    <View style={{
          paddingHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
      }}>
        <Icon style={styles.backArrow} type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => setCurrentScreen(true)}></Icon>
        <Text style={styles.title}>Vehicle Availability</Text>
    </View>
    <TouchableOpacity onPress={()=>selectImage()}>
      <Image
        style={styles.vehicleImage}
        source={image ? {uri: (image?.uri)} : (AppIcon.images.defaultVehicle)}
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
    <Button
      containerStyle={styles.addVehicleContainer}
      style={styles.addVehicleText}
      onPress={() => setCurrentScreen(true)}>
      Done
    </Button>
  </View>)
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

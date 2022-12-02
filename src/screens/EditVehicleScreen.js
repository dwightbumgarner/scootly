import React, {useState} from 'react';
import Button from 'react-native-button';
import {View, StyleSheet, Text, TextInput, Image, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles, AppIcon} from '../AppStyles';
import { Icon } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import NumericInput from 'react-native-numeric-input'
import { DayPicker } from 'react-native-picker-weekday' 
import {SelectList} from 'react-native-dropdown-select-list'


function EditVehicleScreen({navigation, route}) {
  const item = route.params.itemData;
  console.log(item);
  const auth = useSelector((state) => state.auth);
  const [vehicleName, setVehicleName] = useState(item?.vehicleName);
  const [vehicleDescription, setVehicleDescription] = useState(item?.vehicleDescription);
  const [hourlyRate, setHourlyRate] = useState(item?.hourlyRate);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(true);
  const [weekdays, setWeekdays] = React.useState(item?.availableDays);
  const [startSelected, setSSelected] = React.useState((item?.availability).substring(0,item?.availability.indexOf(" - ")));
  const [endSelected, setESelected] = React.useState((item?.availability).substring(item?.availability.indexOf(" - ") + 3));
  const startTimeData = [
      {key:'1', value:'12:00 AM'},
      {key:'2', value:'01:00 AM'},
      {key:'3', value:'02:00 AM'},
      {key:'4', value:'03:00 AM'},
      {key:'5', value:'04:00 AM'},
      {key:'6', value:'05:00 AM'},
      {key:'7', value:'06:00 AM'},
      {key:'8', value:'07:00 AM'},
      {key:'9', value:'08:00 AM'},
      {key:'10', value:'09:00 AM'},
      {key:'11', value:'10:00 AM'},
      {key:'12', value:'11:00 AM'},
      {key:'13', value:'12:00 PM'},
      {key:'14', value:'01:00 PM'},
      {key:'15', value:'02:00 PM'},
      {key:'16', value:'03:00 PM'},
      {key:'17', value:'04:00 PM'},
      {key:'18', value:'05:00 PM'},
      {key:'19', value:'06:00 PM'},
      {key:'20', value:'07:00 PM'},
      {key:'21', value:'08:00 PM'},
      {key:'22', value:'09:00 PM'},
      {key:'23', value:'10:00 PM'},
      {key:'24', value:'11:00 PM'},
  ];
  const endTimeData = [
      {key:'1', value:'12:00 AM'},
      {key:'2', value:'01:00 AM'},
      {key:'3', value:'02:00 AM'},
      {key:'4', value:'03:00 AM'},
      {key:'5', value:'04:00 AM'},
      {key:'6', value:'05:00 AM'},
      {key:'7', value:'06:00 AM'},
      {key:'8', value:'07:00 AM'},
      {key:'9', value:'08:00 AM'},
      {key:'10', value:'09:00 AM'},
      {key:'11', value:'10:00 AM'},
      {key:'12', value:'11:00 AM'},
      {key:'13', value:'12:00 PM'},
      {key:'14', value:'01:00 PM'},
      {key:'15', value:'02:00 PM'},
      {key:'16', value:'03:00 PM'},
      {key:'17', value:'04:00 PM'},
      {key:'18', value:'05:00 PM'},
      {key:'19', value:'06:00 PM'},
      {key:'20', value:'07:00 PM'},
      {key:'21', value:'08:00 PM'},
      {key:'22', value:'09:00 PM'},
      {key:'23', value:'10:00 PM'},
      {key:'24', value:'11:00 PM'},
  ];

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

  const uploadData = async () => {
    if(!vehicleName){
      Alert.alert(
        'Please add a name for your scooter!'
      );
      return;
    }
    if(!vehicleDescription){
      Alert.alert(
        'Please add a description for your scooter!'
      );
      return;
    }
    if(hourlyRate == 0){
      Alert.alert(
        'Please add an hourly rate for your scooter!'
      );
      return;
    }
    if(!weekdays[1]){
      Alert.alert(
        'Please select the days when your scooter is available!'
      );
      return;
    }
    if(!startSelected){
      Alert.alert(
        'Please select the start time of your scooter\'s availability!'
      );
      return;
    }
    if(!endSelected){
      Alert.alert(
        'Please select the end time of your scooter\'s availability!'
      );
      return;
    }
    if(image){
      console.log(image);
      const { uri } = image;
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      setUploading(true);
      const task = storage()
      .ref(filename)
      .putFile(uploadUri);
      try {
        await task;
      } catch (e) {
        console.error(e);
      }

      task.snapshot.ref.getDownloadURL().then(downloadURL => {
        firestore()
        .collection('rentals')
        .doc(item?.id)
        .update({
          vehicleImage: downloadURL,
          hourlyRate: hourlyRate,
          vehicleName: vehicleName,
          vehicleDescription: vehicleDescription,
          availableDays: weekdays,
          availability: startSelected + ' - ' + endSelected,
          vendorUID: auth.user?.id
        })
        .then(() => {
          setUploading(false);
          navigation.navigate('VendorHome');
        });
      })
      setImage(null);
    }else{
      setUploading(true);
      firestore()
      .collection('rentals')
      .doc(item?.id)
      .update({
        hourlyRate: hourlyRate,
        vehicleName: vehicleName,
        vehicleDescription: vehicleDescription,
        availableDays: weekdays,
        availability: startSelected + ' - ' + endSelected,
        vendorUID: auth.user?.id
      })
      .then(() => {
        setUploading(false);
        navigation.navigate('VendorHome');
      });
    }
  };

  return (
    currentScreen ? 
    (<View style={styles.container}>
      <View style={styles.backArrowView}>
          <Icon type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => navigation.navigate('VendorHome')}></Icon>      
      </View>
      <Text style={styles.title}>Edit Scooter</Text>

      <TouchableOpacity onPress={()=>selectImage()}>
        <Image
          style={styles.vehicleImage}
          source={image ? {uri: (image?.uri)} : {uri: (item?.vehicleImage)}}
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
          style={styles.description}
          placeholder="Description"
          multiline={true}
          onChangeText={setVehicleDescription}
          value={vehicleDescription}
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
      <View style={styles.backArrowView}>
        <Icon type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => setCurrentScreen(true)}></Icon>
      </View>
      <Text style={styles.title}>Edit Scooter</Text>
    <Text style={styles.label}>Hourly Rate</Text>
    <NumericInput 
            value={hourlyRate} 
            onChange={setHourlyRate} 
            minValue={1}
            onLimitReached={(isMax,msg) => console.log(isMax,msg)}
            totalWidth={140} 
            totalHeight={50} 
            valueType='integer'
            rounded 
            textColor={AppStyles.color.text}
            leftButtonBackgroundColor={AppStyles.color.background}
            rightButtonBackgroundColor={AppStyles.color.background}
            style={styles.hourlyRate}
            borderColor={AppStyles.color.text}
            iconStyle= {{color: AppStyles.color.white}}
            inputStyle= {{fontFamily: AppStyles.fontFamily.regular}}  />

  <Text style={[styles.label, {marginTop: 50}]}>Availability</Text>
    <SelectList
        data={startTimeData}
        setSelected={(val) => setSSelected(val)}
        save="value"
        search={false}
        dropdownTextStyles={{color:AppStyles.color.text, fontFamily: AppStyles.fontFamily.regular}}
        inputStyles={{color:AppStyles.color.text, fontFamily: AppStyles.fontFamily.regular}}
        placeholder={(item.availability).substring(0,item.availability.indexOf(" - "))}
        boxStyles={{borderRadius: 4, borderWidth: 1, borderColor: AppStyles.color.text}}
    />
    <Text style={[styles.label, {marginTop: 24}]}>To</Text>
    <SelectList
        data={endTimeData}
        setSelected={(val) => setESelected(val)}
        save="value"
        search={false}
        dropdownTextStyles={{color:AppStyles.color.text, fontFamily: AppStyles.fontFamily.regular}}
        inputStyles={{color:AppStyles.color.text, fontFamily: AppStyles.fontFamily.regular}}
        boxStyles={{borderRadius: 4, borderWidth: 1, borderColor: AppStyles.color.text}}
        placeholder={(item.availability).substring(item.availability.indexOf(" - ") + 3)}
    />
    <DayPicker
      weekdays={weekdays}
      setWeekdays={setWeekdays}
      activeColor={AppStyles.color.tint}
      textColor={AppStyles.color.text}
      text={AppStyles.color.white}
      dayTextStyle={{fontFamily: AppStyles.fontFamily.regular}}
      inactiveColor={AppStyles.color.secondarybg}
      itemStyles={{marginHorizontal: 4, borderRadius: 6}}
      wrapperStyles={{marginTop: 30, paddingTop: 0}}
    />
    <Button
      containerStyle={styles.addVehicleContainer}
      style={styles.addVehicleText}
      onPress={uploadData}>
      Done
    </Button>
    {uploading &&
    <View style={styles.loading}>
      <ActivityIndicator size='large' />
    </View>
    }
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
  },
  backArrowView: {
    position: 'absolute',
    left: 30,
    top: 82,
  },
  InputContainer: {
    width: AppStyles.textInputWidth.main,
    marginTop: 20,
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
  availability: {
    marginTop: 20,
    marginBottom: 0,
    paddingLeft: 20,
    paddingRight: 20,
    color: AppStyles.color.text,
  },
  description: {
    height: 100,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    color: AppStyles.color.text,
    fontFamily: AppStyles.fontFamily.regular,
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
  availabilityButtonContainer: {
    width: AppStyles.buttonWidth.main,
    backgroundColor: AppStyles.color.tint,
    borderRadius: AppStyles.borderRadius.main,
    padding: 10,
    marginTop: 10,
  },
  availabilityButtonText: {
    color: AppStyles.color.primarybg,
  },
  vehicleImage: {
    width: 240,
    height: 240,
    borderRadius: 20,
    marginBottom: 20,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    color: AppStyles.color.accent,
    fontFamily: AppStyles.fontFamily.bold,
    textTransform: 'uppercase',
    paddingBottom: 24,
  },
  hourlyRate: {
    marginBottom: 40,
  }
});

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(EditVehicleScreen);

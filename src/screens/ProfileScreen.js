import React, {useState} from 'react'
import {TouchableOpacity, StyleSheet, TextInput, Image, Text, View, Alert } from 'react-native';
import {AppStyles, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import { useSelector} from 'react-redux';
import firestore, { firebase } from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-picker';
import {useDispatch} from 'react-redux';
import auther from '@react-native-firebase/auth';
import {logout} from '../reducers';

function ProfileScreen({navigation}){
    // find current user's data and store the photo
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const user = firebase.auth().currentUser;
    // var initialName = auth.user?.fullname ?? 'Stranger';
    const [image, setImage] = useState(null);
    const [initialName, changeInitialName] = useState(auth.user?.fullname ?? 'Stranger')
    const [userName, changeUserName] = useState('');
    //var photo = auth?.user?.photoURL;
    //console.log(photo)

    const selectImage = () => {
        const options = {
          maxWidth: 2000,
          maxHeight: 2000,
          storageOptions: {
            skipBackup: true,
            path: 'profileImages'
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

    // check if this actually works
    const saveButton = async () => {
        if(userName !== ""){
            console.log("userName", userName.split(' ').slice(0, -1).join(' '))
            if(userName.split(' ').slice(0, -1).join(' ') == ""){
                Alert.alert(
                    "Please enter your first and last name!",
                    [
                        {
                            text: "Cancel",
                            onPress: () => console.log("Cancel Pressed"),
                            style: "cancel"
                        }
                    ]
                );
            }
            else{
                console.log(user);
                const update = {displayName: userName}
                firestore().collection('users').doc(user.uid).update({
                    fullname: update.displayName
                });
                user.updateProfile(update).then(() => {
                    console.log('Update successful');
                    firebase.auth().currentUser.reload().then(() => {
                        const test = firebase.auth().currentUser;
                        console.log(test);
                    });
                }).catch((error) => {
                    console.log('Update unsuccessful' + error);
                });  
                changeInitialName(userName);
                changeUserName('');
            }
        }
    };

    const uploadData = async () => {
        //console.log(image);
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
          console.log(Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000);
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

    // view with header and profile image, resorts to default if cannot find info
    return (
        <View style={styles.container}>
            <View style={{flexDirection: 'row'}}>
            <Text style={styles.title}>
                {initialName}
            </Text>
            <TouchableOpacity 
            onPress={() => {
                auther()
                  .signOut()
                  .then(() => {
                    dispatch(logout());
                    navigation.navigate('LoginStack');
                  }); //logout on redux
              }}>
                  <Image 
                  style = {styles.tinylogout}
                  source = {AppIcon.images.logout}
                  />
            </TouchableOpacity>
            </View>
            <View style={styles.profileImageCircle}>
                <TouchableOpacity onPress={()=>selectImage()}>
                <Image
                    style={styles.profileImage}
                    source={image ? {uri: (image?.uri)} : (AppIcon.images.defaultProfile)}
                />
            </TouchableOpacity>
            </View>
            {/* connect to backend */}
            <View style={styles.InputContainer}>
                <TextInput
                style={styles.body}
                placeholder="Change Name"
                onChangeText={changeUserName}
                value={userName}
                placeholderTextColor={AppStyles.color.white}
                underlineColorAndroid="transparent"
                />
            </View>
            <View style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                justifyContent: "space-around",
            }}>
            <Button
                containerStyle={styles.flowContainer}
                style={styles.flowText}
                title="RENTER FLOW"
                // source={AppIcon.images.logout}
                onPress={() => {
                    navigation.navigate('HomeStack');
                }}
            >
                Renter
            </Button>
            <View style={styles.space} />
            <Button
                containerStyle = {styles.flowContainer}
                style={styles.flowText}
                title="VENDOR FLOW"
                // source={AppIcon.images.logout}
                onPress={() => {
                    navigation.navigate('VendorStack');
                }}
             >
                 Vendor
             </Button>
            </View>
            <Button onPress={()=>saveButton()}
                containerStyle={styles.saveContainer}
                style={styles.flowText}
                title="SAVE">
                    Save
            </Button>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: AppStyles.color.primarybg,
        paddingBottom: 150,
    },
    title: {
        fontSize: AppStyles.fontSize.title,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        paddingTop: 90,
        marginBottom: 50,
        textAlign: 'center',
    },
    profileImageCircle: {
        width: 200,
        height: 200,
        backgroundColor: AppStyles.color.grey,
        borderRadius: 200 / 2,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        overflow:'hidden'
    },
    profileImage: {
        width: 200,
        height: 200,
        /*tintColor:AppStyles.color.accent,*/
    },
    body: {
        height: 50,
        paddingLeft: 20,
        paddingRight: 20,
        color: AppStyles.color.text,
        fontFamily: AppStyles.fontFamily.regular,
    },
    InputContainer: {
        width: AppStyles.textInputWidth.main,
        height: 50,
        marginTop: 50,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        borderRadius: AppStyles.borderRadius.main,
    },
    flowContainer:{
        width: "28%",
        backgroundColor: AppStyles.color.accent,
        borderRadius: AppStyles.borderRadius.main,
        padding: 15,
        marginTop: 45,
    },
    flowText: {
        color: AppStyles.color.primarybg,
        fontFamily: AppStyles.fontFamily.regular,
    },
    saveContainer:{
        position: 'absolute',
        bottom: 20,
        right: 24,
        backgroundColor: AppStyles.color.accent,
        borderRadius: AppStyles.borderRadius.main,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginTop: 30,
    },
    space: {
        width: 40,
        height: 20,
    },
    tinylogout:{
        width: 30,
        height: 30,
        marginTop: 90,
        marginBottom: 50,
        left: 45,
    }
});

export default ProfileScreen;
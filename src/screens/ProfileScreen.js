import React from 'react'
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import {connect, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

// TODO:
    // button to change info (not with google)
        // add/change photo
        // change name
    // button to switch between vendor/renter mode
    
const ProfileScreen = () => {
    // find current user's data and store the photo
    const auth = useSelector((state) => state.auth);
    var photo = auth?.user?.photoURL;
    console.log(photo)

    // view with header and profile image, resorts to default if cannot find info
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{auth.user?.fullname ?? 'Stranger'}</Text>
            <View style={styles.profileImageCircle}>
                <Image source={photo ? {uri: photo} : AppIcon.images.defaultProfile} style={styles.profileImage}/>
            </View>
        </View>
    );
};

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
        paddingTop: 80,
        marginBottom: 48,
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
    }
});

export default ProfileScreen;
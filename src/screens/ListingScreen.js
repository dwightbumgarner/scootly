import React, {useState, useEffect} from 'react';
import {Animated, TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import { Icon } from 'react-native-elements'
import {AppStyles, AppIcon, width} from '../AppStyles';
import firestore, { firebase } from '@react-native-firebase/firestore';

const messagesIcon = require('../../assets/icons/messages-icon-black.png')

// TODO:  
    // create booking screen

function messageVendor(item, nav){
    // get user
    const user = firebase.auth().currentUser;
    
    //search for conversation including both user and vendor
    firestore()
    .collection('conversations')
    .where('participants', 'array-contains', item.vendorUID, user.uid)
    .get()
    .then(collectionSnapshot => {
        console.log(collectionSnapshot.size);
        // if conversation doesn't exist, make new one and recursively call function
        if (collectionSnapshot.size === 0) {
            
            console.log('Creating conversation with ' + item.vendorName);
            firestore().collection('conversations').add({
                participants: [user.uid, item.vendorUID],
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log('Opening conversation with ' + item.vendorName);
                nav.navigate("MessageStack", {screen: "Conversation", params: {convObject: convo}});
            });
        }
        // otherwise open existing conversation.
        else {
            console.log('Existing conversation found.');

            firestore().collection('users').doc(item.vendorUID).get().then(userDoc => {
                let colDoc = collectionSnapshot.docs[0];
                let convo = {id: colDoc.id, data: colDoc.data(), friend: userDoc.data()}

                console.log('Opening conversation with ' + item.vendorName);
                nav.navigate("MessageStack", {screen: "Conversation", params: {convObject: convo}});
            }) 
            
        }
    })
}

const ListingScreen = ({navigation, route}) => {

    const item = route.params.itemData;
    
    return (
        <View style={styles.container}>
        <View style={styles.backArrowView}>
            <Icon style={styles.backArrow} type="ionicon" name="arrow-back-outline" color={AppStyles.color.accent} size={27} onPress={() => navigation.navigate('Home')}></Icon></View>
            <Text style={styles.title}>{item?.vehicleName}</Text>
            <Text style={styles.subtitle}>VENDOR: {item?.vendorName}</Text>
            <View style={styles.body}>
                <Image source={{uri: item?.vehicleImage}} style={styles.vehicleImage}/>
            </View>
            <Text style={styles.descriptionTitle}>Description</Text>
            <View style={styles.description}>
                <Text style={styles.descriptionText}>{item?.vehicleDescription}</Text>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.messageContainer} onPress={() => {messageVendor(item, navigation)}}>
                    <Text style={styles.messageButtonText}> 
                        Message {item?.vendorName?.split(' ').slice(0, -1).join(' ')}
                    </Text>
                    <Image source={messagesIcon} style={styles.messageButtonIcon}/>
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity> */}
            </View>
            
        </View>
    )
}
export default ListingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: AppStyles.color.primarybg,
    },
    title: {
        paddingTop: 80,
        fontSize: AppStyles.fontSize.title,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        marginBottom: 0,
    },
    subtitle: {
        paddingTop: 10,
        color: AppStyles.color.secondarytext,
        fontSize: AppStyles.fontSize.small,
        fontFamily: AppStyles.fontFamily.bold,
        textTransform: 'uppercase',
    },
    vehicleImage: {
        width: 240,
        height: 240,
        borderRadius: 20,
        marginTop: 40,
        marginBottom: 40
    },
    backArrowView: {
        position: 'absolute',
        left: 30,
        top: 82,
    },
    body: {
        width: '100%',
        justifyContent:'space-around',
        alignItems:'center',
    },
    descriptionTitle: {
        fontSize: AppStyles.fontSize.content,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        marginRight: 210,
        marginBottom: 4
    },
    description: {
        paddingTop: 10,
        justifyContent: "space-between",
        display:'flex',
        flexDirection:'row',
    },
    descriptionText: {
        width: "80%",
        textAlign: "left",
        fontSize: AppStyles.fontSize.body,
        fontFamily: AppStyles.fontFamily.regular,
        color: AppStyles.color.white,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        paddingVertical: 16,
        marginTop: 30,
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
    },
    messageContainer: {
        flexDirection:'row',
        alignItems:'center',
        padding:15,
        backgroundColor: AppStyles.color.accent,
        borderRadius: AppStyles.borderRadius.main,
        marginTop: 30,
    },
    // bookButtonText: {
    //     color: AppStyles.color.background,
    //     fontFamily: AppStyles.fontFamily.regular,
    //     paddingHorizontal: 10
    // },
    messageButtonText: {
        color: AppStyles.color.background,
        fontFamily: AppStyles.fontFamily.regular,
        paddingRight: 10,
        paddingLeft: 5
    },
    messageButtonIcon: {
        tint: AppStyles.color.background,
        height: 16,
        width: 16
    }
    // bookButton: {
    //     backgroundColor: AppStyles.color.accent,
    //     borderRadius: AppStyles.borderRadius.main,
    //     height:45,
    //     padding:5,
    //     fontSize:15,
    //     borderWidth:2,
    //     marginLeft:20,
    //     marginRight:10,
    //     justifyContent:'center',
    //     alignItems:'center'
    // }
});
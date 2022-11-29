import React, {useState, useEffect} from 'react';
import {Animated, TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import {AppStyles, AppIcon, width} from '../AppStyles';
import firestore, { firebase } from '@react-native-firebase/firestore';

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
                //messageVendor(item);
            });
        }
        // otherwise open existing conversation.
        else {
            console.log('Existing conversation found.');

            firestore().collection('users').doc(item.vendorUID).get().then(userDoc => {
                let colDoc = collectionSnapshot.docs[0];
                let convo = {id: colDoc.id, data: colDoc.data(), friend: userDoc.data()}

                console.log('Opening conversation with ' + item.vendorName);
                nav.navigate("Conversation", {convObject: convo})
            }) 
            
        }
    })
}

const ListingView = ({navigation, route}) => {

    const item = route.params.itemData;
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                    <Image source={AppIcon.images.backArrow} style={AppIcon.style}/>
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                <Text style={{color:'white', fontSize:30}}> {item?.vendorName}'s {item?.vehicleName}</Text>
                <Image source={{uri: item?.vehicleImage}} style={{height: 300, width: 300}}/>
            </View>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.messageContainer} onPress={() => {messageVendor(item, navigation)}}>
                    <Text style={styles.buttonText}> 
                        Send Message
                    </Text>
                    <Image source={AppIcon.images.messages} style={AppIcon.style}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.buttonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    )
}
export default ListingView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        
        backgroundColor: AppStyles.color.primarybg,
    },
    header: {
        height: '10%',
        width: '100%',
        borderBottomColor:'black',
        borderBottomWidth:3,
        justifyContent:'center'
    },
    body: {
        height:'80%',
        width: '100%',
        justifyContent:'space-around',
        alignItems:'center',
    },
    footer: {
        height: '10%',
        width: '100%',
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
    },
    messageContainer: {
        flexDirection:'row',
        alignItems:'center',
        borderColor:'white',
        borderRadius:10,
        borderWidth:2,
        padding:5,
        height:45
    },
    buttonText: {
        
        fontSize:15,
        color:'white',
        marginRight:10,
    },
    bookButton: {
        height:45,
        padding:5,
        fontSize:15,
        borderColor:AppStyles.color.accent,
        borderWidth:2,
        borderRadius:10,
        marginLeft:20,
        marginRight:10,
        justifyContent:'center',
        alignItems:'center'
    }
});
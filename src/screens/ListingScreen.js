import React, {useState, useEffect} from 'react';
import {Animated, TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import { Icon } from 'react-native-elements'
import {AppStyles, AppIcon, width} from '../AppStyles';
import firestore, { firebase } from '@react-native-firebase/firestore';

const messagesIcon = require('../../assets/icons/messages-icon-black.png')

async function messageVendor(item, setConvo){

    const user = firebase.auth().currentUser;

    firestore().collection('users').doc(item.vendorUID).get().then(friendDoc => {

        firestore()
        .collection('conversations')
        .where('participants', 'array-contains', user.uid)
        .get()
        .then(collectionSnapshot => {
            console.log(collectionSnapshot.size + " conversations found.");

            let docs = collectionSnapshot.docs;
            let found = false;
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].data().participants.includes(item.vendorUID)){

                    console.log("Found conversation with " + item.vendorName);
                    setConvo({id: docs[i].id, data: docs[i].data(), friend: friendDoc.data()});
                    found = true;
                }
            }

            if (collectionSnapshot.size === 0 || found === false) {
                firestore().collection('conversations').add({
                    participants: [user.uid, item.vendorUID],
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    updatedAt: firestore.FieldValue.serverTimestamp(),
                    messages: []
                })
                .then(newDoc => {
                    firestore().collection('conversations').doc(newDoc.id).get()
                    .then(doc => {
                        setConvo({id: doc.id, data: doc.data(), friend: friendDoc.data()})
                    })
                })
            }
        })
    })
    .catch(() => {
        console.log("Could not find vendor.");
    })
}

const ListingScreen = ({navigation, route}) => {

    const item = route.params.itemData;
    const [convo, setConvo] = useState(null);

    useEffect(() => {
        
        if (convo !== null) {
            console.log("Opening conversation with " + convo.friend.fullname);
            navigation.navigate("MessageStack", {screen: "Conversation", params: {convObject: convo}});
            setConvo(null);
        }
    }, convo);
    
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
                <TouchableOpacity 
                style={styles.messageContainer} 
                onPress={() => {messageVendor(item, setConvo)} }
                >
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
        bottom: 30,
        right: 24,
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-end',
    },
    messageContainer: {
        flexDirection:'row',
        alignItems:'center',
        padding:16,
        backgroundColor: AppStyles.color.accent,
        borderRadius: AppStyles.borderRadius.main,
    },
    // bookButtonText: {
    //     color: AppStyles.color.background,
    //     fontFamily: AppStyles.fontFamily.regular,
    //     paddingHorizontal: 10
    // },
    messageButtonText: {
        color: AppStyles.color.background,
        fontFamily: AppStyles.fontFamily.regular,
        fontSize: AppStyles.fontSize.normal,
        paddingRight: 10,
        paddingLeft: 5
    },
    messageButtonIcon: {
        tintColor: AppStyles.color.background,
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
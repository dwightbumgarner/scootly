import React, { useEffect, useState, useCallback } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

// TODO: 
    // add time sent (already exists) to message blurb
    // fix positioning of components while text input is up (distorts screen upwards)
    // proportional sizing of messages
    // order conversations on screen by RECENCY
    // automatically scroll to bottom when new message or opening convo
    // CHANGE TO FLATLIST
    // safeAreaContext for iphone profile photo getting cut off
    // add subscriber to conversation list

const MessageScreen = ({navigation, route}) => {
 
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [convoIds, setConvoIds] = useState([]);
    const [convoData, setConvoData] = useState([]);
    const [friendData, setFriendData] = useState([]);

    const user = firebase.auth().currentUser;

    // get list of conversations involving the user
    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused

            firestore()
            .collection('conversations')
            .where('participants', 'array-contains', user.uid)
            .get()
            .then(collectionSnapshot => {
                setCount(collectionSnapshot.size);

                collectionSnapshot.forEach(docSnapshot => {

                    // set index of other user based on position in array
                    let part = docSnapshot.data().participants;
                    var friendIndex = part[0] === user.uid ? 1 : 0;
                    
                    // get data of other participant
                    firestore()
                        .collection('users')
                        .doc(part[friendIndex])
                        .get()
                        .then(userSnapshot => {
                            // load data into state variable if non duplicate
                            if (!convoIds.includes(docSnapshot.id)){
                                console.log("Total conversations: " + count);
                                setConvoIds(convoIds.concat(docSnapshot.id));
                                setConvoData(convoData.concat(docSnapshot.data()));
                                setFriendData(friendData.concat(userSnapshot.data()));
                            }
                            if (convoIds.length === count){
                                setLoading(false);
                            }
                    });
                });
            });
            
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
            };
        }, [loading == true])
    );

    // if user has conversations, list them
    if(loading){
        return(<ActivityIndicator
            style={{marginTop: 30}}
            size="large"
            animating={loading}
            color={AppStyles.color.tint}
          />);
    }
    else if (count > 0){
        // create convo scructure for singular conversation, including all 3 data elements
        var convos = [];
        for (let i = 0; i < count; i++){
            convos.push({id: convoIds[i], data: convoData[i], friend: friendData[i]});
        }

        // map out list of conversations user is involved in--onto the screen
        var convoList = convos.map(convo => {
            
            let mesLen = convo.data?.messages?.length;
            var name = convo.friend ? convo.friend?.fullname : 'name';
            var latestMessage = convo.data?.messages ? convo.data.messages[mesLen]?.content : 'No messages yet';
            var photo = convo.friend?.photoURL;
            
            // Clicking a Connection opens a Conversation with another user 
            return (
                <TouchableOpacity 
                style={styles.connection} 
                onPress={() => {
                    console.log('Opened conversation with ' + convo.friend?.fullname);
                    navigation.navigate("Conversation", {convObject: convo});
                }}
                >
                    <View style={styles.connectionPhotoCircle}> 
                        <Image 
                        source={photo ? {uri: photo} : AppIcon.images.defaultProfile} 
                        style={styles.connectionPhoto}/>
                    </View>
                    <View>
                        <Text style={styles.name}> {name} </Text>
                        <Text style={styles.lastMessage}> {latestMessage} </Text>
                    </View>
                </TouchableOpacity>
            )
        });
    }
    else {
        convoList = <Text style={styles.noConversationsText}>You don't seem to have any conversations yet... why not get out there and start one?</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Messages </Text>
            <ScrollView>
                { convoList }
            </ScrollView>
        </View>
    ); 
}
export default MessageScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: AppStyles.color.primarybg,
    },
    title: {
        fontSize: AppStyles.fontSize.title,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        paddingTop: 80,
        marginBottom: 48,
        textAlign: 'center',
    },
    connection: {
        width:300,
        height:100,
        marginBottom: 15,
        borderRadius:30,
        backgroundColor: AppStyles.color.secondarybg,
        alignItems:'center',
        flexDirection:'row',
    },
    connectionPhotoCircle: {
        width: 40,
        height: 40,
        backgroundColor:AppStyles.color.grey,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        marginRight: 20,
    },
    connectionPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    name: {
        fontSize: AppStyles.fontSize.content,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.regular,
        color: AppStyles.color.white,
        marginLeft: 10
    },
    noConversationsText: {
        width: '75%',
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '50%',
        color: AppStyles.color.text,
        fontFamily: AppStyles.fontFamily.regular,
        fontSize: AppStyles.fontSize.normal,
    }
});
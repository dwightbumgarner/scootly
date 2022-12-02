import React, { useEffect, useState, useCallback } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import firestore, { firebase, orderBy } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

// TODO: 
    // add time sent (already exists) to message blurb
    // order conversations on screen by RECENCY
    // add subscriber to conversation list
    // noconversationsText not showing on android

const MessageScreen = ({navigation, route}) => {
 
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [convoIds, setConvoIds] = useState([]);
    const [convos, setConvos] = useState([]);

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
                console.log("Total conversations: " + collectionSnapshot.size);

                if (collectionSnapshot.size === 0) {
                    setLoading(false);
                }

                collectionSnapshot.forEach(doc => {
                    // set index of other user based on position in array
                    let part = doc.data().participants;
                    var friendIndex = part[0] === user.uid ? 1 : 0;
                    
                    // get data of other participant
                    firestore()
                        .collection('users')
                        .doc(part[friendIndex])
                        .get()
                        .then(userSnapshot => {
                            // load data into state variable if non duplicate
                            if (!convoIds.includes(doc.id)){
                                setConvoIds(convoIds.concat(doc.id));
                                setConvos(convos.concat({id: doc.id, data: doc.data(), friend: userSnapshot.data()}));
                                console.log("added " + doc.id);
                            }
                            
                            setLoading(false);
                    });
                });
            })
            .catch(() => {
                console.log("Error loading conversations");
                setLoading(false);
            })
            
            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
            };
        }, [loading == true])
    );


    const ConvoBlurb = ({item}) => {
        let mesLen = item.data?.messages?.length;
        var name = item.friend ? item.friend?.fullname : 'name';
        var latestMessage = item.data?.messages ? item.data.messages[mesLen - 1]?.content : 'No messages yet';
        var photo = item.friend?.photoURL;
        // Clicking a Connection opens a Conversation with another user 

        return (
            <TouchableOpacity 
            style={styles.connection} 
            onPress={() => {
                console.log('Opened conversation with ' + item.friend?.fullname);
                navigation.navigate("Conversation", {convObject: item});
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
    }

    // if user has conversations, list them
    if (loading === true){
        return(
        <ActivityIndicator
            style={{backgroundColor: AppStyles.color.primarybg, height: '100%'}}
            size="large"
            animating={loading}
            color={AppStyles.color.tint}
          />
        );
    }
    else {
        return (
            <View style={styles.container}>
                <Text style={styles.title}> Messages </Text>
                <SafeAreaView>
                    {
                        convos.length > 0 
                        ? 
                        <FlatList
                        data={convos}
                        renderItem={ConvoBlurb}
                        ketExtractor={(item, index) => item.id}
                        />
                        :
                        <Text style={styles.noConversationsText}>
                            You don't seem to have any conversations yet... why not get out there and start one?
                        </Text>
                    }
                    
                </SafeAreaView>
            </View>
        ); 
    }
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
        width:340,
        height:90,
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
        color: 'white',
        fontFamily: AppStyles.fontFamily.regular,
        fontSize: AppStyles.fontSize.normal,
    }
});
import React, { useEffect, useState } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import {connect, useSelector} from 'react-redux';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { create } from 'lodash';

// Clicking a Connection opens a Conversation with another user 

// TODO: 
    // separate into different files
    // add time sent to message
    // fix positioning of components while text input is up (distorts screen upwards)
    // add CONVERSATION creation (probably on listings page, create new conversation with two users)
    // proportional sizing of messages
    // order conversations on screen by RECENCY
    // automatically scroll to bottom when new message or opening convo

// Create conversation document in database; to be called in homescreen
export function createConversation(user1, user2, opener){
    var a = firestore()
        .collection('conversations')
        .add(
        {
            participants: [user1, user2],
            messages: [
                {
                    content: opener,
                    sender: user1,
                    sentAt: firestore.FieldValue.serverTimestamp()
                }
            ],
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp()
        }
    );
}

// add a message to current conversation
export function writeMessage(convoId, content, sender) {
    // cannot send empty message
    if (content == '') {
        console.log('No message to be sent.');
        return;
    }
    // add message content into array
    var a = firestore().collection('conversations').doc(convoId).update({
        messages: firestore.FieldValue.arrayUnion({content: content, sender: sender, sentAt: Date.now()}),
        updatedAt: firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('New message sent.');
    })
    .catch(() => {
        // ERROR
        console.log('Message failed to send.');
    })
}

// Screen for specific converesation with other user
const ConversationScreen = (props) => {
    const user = firebase.auth().currentUser;
    const friend = props.convObject.friend;
    const [messageBuffer, setMessageBuffer] = useState('');
    const [messageList, setMessageList] = useState([]);

    // when text is typed into input buffer, fetch recent updates to conversation
    useEffect(() => {
        firestore().collection('conversations').doc(props.convObject.id).get().then(doc => {
            setMessageList(doc.data().messages);
        })
    }, [messageBuffer]);

    // Create map of message array, each item becomes a blurb depending on sender
    const MessageList = () => {
        return(
            messageList.map(message => {
            return (
                <View style={user.uid == message.sender ? styles.sentMessageBlurb : styles.recMessageBlurb}>
                    <Text>{message.content}</Text>
                </View>
            )
        })
        )
    };

    return (
        <View style={styles.container}>

            <View style={styles.convoHeader}>
                <Button onPress={props.handleClick}>
                   <Image source={AppIcon.images.backArrow} style={AppIcon.style}/>
                </Button>

                <View style={styles.friendBox}>
                    <Image source={{uri: friend.photoURL}} style={{height: 75, width: 75, borderRadius: 75}}/>
                    <Text style={{color:'white', fontSize:20}}> {friend.fullname} </Text>
                </View>

                <View>
                    <Text>Options</Text>
                </View>
            </View>

            <ScrollView style={styles.messageContainer}>
                <MessageList/>
            </ScrollView>

            <View style={styles.composeBar}>
                <View style={styles.InputContainer}>
                    <TextInput
                    style={styles.inputBody}
                    placeholder="Message"
                    value={messageBuffer}
                    onChangeText={setMessageBuffer}
                    />
                </View>
                <Button 
                containerStyle={styles.sendButton} 
                onPress={() => { 
                    writeMessage(props.convObject.id, messageBuffer, user.uid);
                    setMessageBuffer('');
                }}
                >
                    <Image source={AppIcon.images.upArrow} style={AppIcon.style}/>    
                </Button>
                
            </View>

        </View>
    );
};

// Main screen showing list of conversations
const MessagesScreen = () => {
    // find user, get list of conversations
    const user = firebase.auth().currentUser;
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [convoIds, setConvoIds] = useState([]);
    const [convoData, setConvoData] = useState([]);
    const [friendData, setFriendData] = useState([]);
    const [focusedConvo, setFocusedConvo] = useState(null);

    // occurs in background while loading:
        // get list of conversations that include current suer
    useEffect(() => {
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
                            
                            setConvoIds(convoIds.concat(docSnapshot.id));
                            setConvoData(convoData.concat(docSnapshot.data()));
                            setFriendData(friendData.concat(userSnapshot.data()));
                        }
                        if (convoIds.length === count){
                            console.log("Total conversations: " + count);
                            setLoading(false);
                        }
                });
            });
        });
        
    }, [loading == true]);

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
            var name = convo.friend ? convo.friend.fullname : 'name';
            var latestMessage = convo.data ? convo.data.messages[mesLen - 1].content : 'message';
            var photo = convo.friend?.photoURL;
            
            return (
                <TouchableOpacity 
                style={styles.connection} 
                onPress={() => {
                    setFocusedConvo(convo); 
                    console.log('Opened conversation with ' + convo.friend.fullname)
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

    // switch screen to focused conversation on press
    if (focusedConvo != null) {
        return <ConversationScreen 
                convObject={focusedConvo} 
                handleClick={() => {setFocusedConvo(null)}}
                />
    }
    else {
        return (
            <View style={styles.container}>
                <Text style={styles.title}> Messages </Text>
                <ScrollView>
                    { convoList }
                </ScrollView>
            </View>
        );
    }   
}

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
        width:'87%',
        height:'14%',
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
    convoHeader: {
        height: '20%',
        width: '90%',
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        borderBottomStyle:'solid',
        borderBottomColor:'black',
        borderBottomWidth: 1
    },
    friendBox: {
        width: '50%',
        height: '100%',
        
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-evenly',
        alignItems:'center'

    },
    messageContainer: {
        width: '95%',
        
    },
    sentMessageBlurb: {
        minWidth:120,
        minHeight: 60,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        backgroundColor: AppStyles.color.accent,
        marginLeft: 200,
        marginTop: 5,
        marginBottom: 5
    },
    recMessageBlurb: {
        minWidth: 120,
        minHeight: 60,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        backgroundColor: AppStyles.color.grey,
        marginRight: 200,
        marginTop: 5,
        marginBottom: 5
    },
    composeBar: {
        width: '100%',
        height: '7%',
        backgroundColor:'black',
        marginTop:10,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around'
    },
    InputContainer: {
        width: '60%',
        height: '70%',
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        backgroundColor:AppStyles.color.grey
      },
      inputBody: {
        
        fontColor: 'white',
        fontFamily: AppStyles.fontFamily.regular
      },
      sendButton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: AppStyles.color.grey,
        alignItems:'center',
        justifyContent:'center'
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

export default MessagesScreen;
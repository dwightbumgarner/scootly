import React, { useEffect, useState } from 'react'
import {TouchableOpacity, StyleSheet, Image, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import {connect, useSelector} from 'react-redux';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { create } from 'lodash';

// Clicking a Connection opens a Conversation with another user

// TODO: 
    // separate into different files
    // add time sent to message
    // style properly
    // fix positioning of components while composing new message
    // fix overflow of messages, add scroll
    // add CONVERSATION creation (probably on listings page, create new conversation with two users)

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

export function writeMessage(convoId, content, sender) {

    if (content == '') {
        console.log('No message to be sent.');
        return;
    }

    var a = firestore().collection('conversations').doc(convoId).update({
        messages: firestore.FieldValue.arrayUnion({content: content, sender: sender, sentAt: Date.now()}),
        updatedAt: firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('New message sent.');
    })
    .catch(() => {
        console.log('Message failed to send.');
    })
}

const ConversationScreen = (props) => {
    const user = firebase.auth().currentUser;
    const friend = props.convObject.friend;
    const [messageBuffer, setMessageBuffer] = useState('');
    const [messageList, setMessageList] = useState([]);

    useEffect(() => {
        firestore().collection('conversations').doc(props.convObject.id).get().then(doc => {
            setMessageList(doc.data().messages);
        })
    }, [messageBuffer])

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

            <View style={styles.messageContainer}>
                <MessageList/>
            </View>

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

const MessagesScreen = () => {
    // find user, get list of conversations
    const user = firebase.auth().currentUser;
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(0);
    const [convoIds, setConvoIds] = useState([]);
    const [convoData, setConvoData] = useState([]);
    const [friendData, setFriendData] = useState([]);
    const [focusedConvo, setFocusedConvo] = useState(null);

    useEffect(() => {
        firestore()
        .collection('conversations')
        .where('participants', 'array-contains', user.uid)
        .get()
        .then(collectionSnapshot => {
            setCount(collectionSnapshot.size);
            console.log("Total conversations: " + count);

            collectionSnapshot.forEach(docSnapshot => {
                
                // TODO: change participants[1] to OTHER participant
                firestore()
                    .collection('users')
                    .doc(docSnapshot.data().participants[1])
                    .get()
                    .then(userSnapshot => {
                        //console.log(userSnapshot.data());
                        if (!convoIds.includes(docSnapshot.id)){
                            setConvoIds(convoIds.concat(docSnapshot.id));
                            setConvoData(convoData.concat(docSnapshot.data()));
                            setFriendData(friendData.concat(userSnapshot.data()));
                        }
                        if (convoIds.length == count){
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
        var convos = [];
        for (let i = 0; i < count; i++){
            convos.push({id: convoIds[i], data: convoData[i], friend: friendData[i]});
        }

        var convoList = convos.map(convo => {
            
            var name = convo.friend ? convo.friend.fullname : 'name';
            var latestMessage = convo.data ? convo.data.messages[0].content : 'message';
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
        convoList = <Text style={styles.title}>No conversations found.</Text>;
    }

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
                <View style={styles.connectionList}>
                { convoList }
                </View>
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
        paddingBottom: 100,
    },
    title: {
        fontSize: AppStyles.fontSize.title,
        fontFamily: AppStyles.fontFamily.bold,
        color: AppStyles.color.white,
        paddingTop: 80,
        marginBottom: 48,
        textAlign: 'center',
    },
    connectionList: {
        width:'100%',
        height:'100%',
        alignItems:'center',
    },
    connection: {
        width:'87%',
        height:'15%',
        marginBottom: 15,
        borderRadius:12,
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
        height: '75%',
        width: '95%',

        display: 'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'flex-end',
        overflow:'scroll'
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
        minWidth:120,
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
        width: '95%',
        height: '10%',
        backgroundColor:'black',
        marginTop:30,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around'
    },
    InputContainer: {
        width: '60%',
        height: '80%',
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
      }
});

export default MessagesScreen;
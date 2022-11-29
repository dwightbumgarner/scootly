import React, { useEffect, useState } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import firestore, { firebase } from '@react-native-firebase/firestore';

// TODO: Find better way to check for updates and refresh automatically
    // boundless useEffect() causes memory leak

// add a message to current conversation
export function writeMessage(convoId, content, sender) {
    // cannot send empty message
    if (content == '') {
        console.log('No message to be sent.');
        return;
    }
    // add message content into array
    firestore().collection('conversations').doc(convoId).update({
        messages: firestore.FieldValue.arrayUnion({content: content, sender: sender, sentAt: Date.now()}),
        updatedAt: firestore.FieldValue.serverTimestamp()
    })
    .then(() => { console.log('New message sent.');})
    .catch(() => {console.log('Message failed to send.');});
}

// Screen for specific converesation with other user
const Conversation = ({navigation, route}) => {
    const [messageBuffer, setMessageBuffer] = useState('');
    const [messageList, setMessageList] = useState([]);

    const convObject = route.params.convObject;
    const user = firebase.auth().currentUser;
    const friend = convObject?.friend;

    // when text is typed into input buffer, fetch recent updates to conversation
    useEffect(() => {
        // causing memory leak
        firestore().collection('conversations').doc(convObject.id).get().then(doc => {
            setMessageList(doc.data().messages ?? []);
        })
    }, []);

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
                <Button onPress={() => {navigation.goBack()}}>
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

            <ScrollView 
            style={styles.messageContainer}
            >
                <MessageList/>
            </ScrollView>

            <View style={styles.composeBar}>
                <View style={styles.inputContainer}>
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
                    writeMessage(convObject.id, messageBuffer, user.uid);
                    setMessageBuffer('');
                }}
                >
                    <Image source={AppIcon.images.upArrow} style={AppIcon.style}/>    
                </Button>
                
            </View>

        </View>
    );
};
export default Conversation;

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
    inputContainer: {
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
      }
})
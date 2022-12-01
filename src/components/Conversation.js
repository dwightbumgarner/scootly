import React, { useEffect, useState, useCallback } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { faPiggyBank } from '@fortawesome/free-solid-svg-icons';

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

    const convObject = route.params?.convObject;
    const user = firebase.auth().currentUser;
    const friend = convObject?.friend;

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused
            const sub = firestore()
            .collection('conversations')
            .doc(convObject?.id)
            .onSnapshot(doc => {
                setMessageList(doc.data().messages ?? []);
                console.log('Messages updated.')
            });

            // Do something when the screen is unfocused
            // Useful for cleanup functions
            return () => sub();
        }, [user.uid])
    );

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
                <Button onPress={() => {navigation.navigate("Messages")}}>
                   <Image source={AppIcon.images.backArrow} style={AppIcon.style}/>
                </Button>

                <View style={styles.friendBox}>
                    <Image source={{uri: friend?.photoURL}} style={{height: 75, width: 75, borderRadius: 75}}/>
                    <Text style={{color:'white', fontSize:20, paddingTop:20}}> {friend?.fullname} </Text>
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
                    writeMessage(convObject?.id, messageBuffer, user.uid);
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
        backgroundColor: AppStyles.color.primarybg
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
        height: '25%',
        paddingTop: 30,
        width: '90%',
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        borderBottomStyle:'solid',
        borderBottomColor: AppStyles.color.primarybg,
        borderBottomWidth: 1 
    },
    friendBox: {
        width: '50%',
        height: '60%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-evenly',
        alignItems:'center',
        marginTop: 10

    },
    messageContainer: {
        width: '100%',
        paddingBottom: 10,
        backgroundColor: AppStyles.color.primarybg
  
    },
    sentMessageBlurb: {
        minWidth:120,
        minHeight: 40,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        backgroundColor: AppStyles.color.accent,
        marginLeft: 200,
        marginRight: 15,
        marginTop: 5,
        marginBottom: 5
    },
    recMessageBlurb: {
        minWidth: 120,
        minHeight: 40,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        backgroundColor: AppStyles.color.grey,
        marginRight: 200,
        marginLeft: 15,
        marginTop: 5,
        marginBottom: 5
    },
    composeBar: {
        width: '100%',
        height: '7%',
        backgroundColor: AppStyles.color.primarybg,
        marginTop: 10,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around'
    },
    inputContainer: {
        width: '80%',
        height: '70%',
        marginLeft: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        backgroundColor:AppStyles.color.text,
    
      },
      inputBody: {
        paddingTop: 6,
        left: 10,
        fontColor: AppStyles.color.text,
        fontFamily: AppStyles.fontFamily.regular
      },
      sendButton: {
        height: 45,
        width: 45,
        borderRadius: 30,
        backgroundColor: AppStyles.color.grey,
        alignItems:'center',
        justifyContent:'center',
        marginRight: 5
      }
})
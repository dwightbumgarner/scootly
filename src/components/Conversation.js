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
    if (content === '') {
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
    const [listRef, setListRef] = useState(null);
    
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
                console.log('Messages updated.');
            })
            
            // Do something when the screen is unfocused
            // Useful for cleanup functions
            return () => sub();
        }, [user.uid])
    );

    const Message = ({item}) => (
        <View style= {user.uid == item.sender ? styles.sentMessageBlurb : styles.recMessageBlurb} >
            <Text style={user.uid == item.sender ? styles.sentMessageText : styles.recMessageText}>{item.content}</Text>
        </View>
    )

    return (
        <View style={styles.container}>

            <View style={styles.convoHeader}>
                <Button onPress={() => {navigation.navigate("Messages")}}>
                   <Image source={AppIcon.images.backArrow} style={AppIcon.style}/>
                </Button>

                <View style={styles.friendBox}>
                    <Image source={{uri: friend?.photoURL}} style={{height: 75, width: 75, borderRadius: 75, paddingTop: 10}}/>
                    <Text style={{color:'white', fontSize:20, paddingTop:20}}> {friend?.fullname} </Text>
                </View>

                <View>
                    <Text>Options</Text>
                </View>
            </View>

            <SafeAreaView style={styles.messageContainer}>
                <FlatList 
                data={messageList} 
                renderItem={Message} 
                keyExtractor={(item, index) => item.sentAt}
                ref={(ref) => {setListRef(ref);}}
                onContentSizeChange={() => {listRef.scrollToEnd()}}
                />
            </SafeAreaView>

            <View style={styles.composeBar}>
                <View style={styles.inputContainer}>
                    <TextInput
                    style={styles.inputBody}
                    placeholder=" Message"
                    value={messageBuffer}
                    onChangeText={setMessageBuffer}
                    placeholderTextColor={'grey'}
                    cursorColor={AppStyles.color.accent}
                    />
                </View>
                <Button 
                containerStyle={styles.sendButton} 
                onPress={() => {
                    writeMessage(convObject?.id, messageBuffer, user.uid);
                    setMessageBuffer('');
                    listRef.scrollToEnd({ animated: true });
                  }}
                >
                    <Image source={AppIcon.images.upArrow} style={styles.sendIcon}/>    
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
        height: 180,
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
        height: '50%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-evenly',
        alignItems:'center',
        marginTop: 40

    },
    messageContainer: {
        flex:1,
        width: '100%',
        maxHeight: '70%',
        paddingBottom: 10,
        backgroundColor: AppStyles.color.primarybg
    },
    sentMessageBlurb: {
        display:'flex',
        minWidth:120,
        minHeight: 40,
        maxWidth: "45%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:15,
        backgroundColor: AppStyles.color.accent,
        marginLeft: 200,
        marginRight: 15,
        marginTop: 5,
        marginBottom: 5,
        padding: 10
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
        marginBottom: 5,
        padding: 10,
    },
    composeBar: {
        width: '100%',
        minHeight: 60,
        backgroundColor:AppStyles.color.primarybg,
        marginTop:10,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around'
    },
    inputContainer: {
        width: 270,
        height: 40,
        borderRadius: 20,
        marginLeft: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        backgroundColor:AppStyles.color.grey,
        paddingLeft:10,
        paddingRight:10
      },
      inputBody: {
        paddingTop: 7,
        left: 1,
        color: AppStyles.color.white,
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
      },
      sendIcon: {
        tintColor:AppStyles.color.accent,
        height: 20,
        width: 20,
      }
})
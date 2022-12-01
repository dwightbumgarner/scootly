import React, { useEffect, useState, useCallback } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

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

    async function doRef(ref) {
        setListRef(ref);
    }

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
        <View style={user.uid == item.sender ? styles.sentMessageBlurb : styles.recMessageBlurb}>
            <Text>{item.content}</Text>
        </View>
    )

    return (
        <View style={styles.container}>

            <View style={styles.convoHeader}>
                <Button onPress={() => {navigation.navigate("Messages")}}>
                   <Image source={AppIcon.images.backArrow} style={AppIcon.style}/>
                </Button>

                <View style={styles.friendBox}>
                    <Image source={{uri: friend?.photoURL}} style={{height: 75, width: 75, borderRadius: 75}}/>
                    <Text style={{color:'white', fontSize:20}}> {friend?.fullname} </Text>
                </View>

                <View>
                    <Text>Options</Text>
                </View>
            </View>

            <SafeAreaView style={styles.messageContainer}>
                <FlatList 
                data={messageList} 
                renderItem={Message} 
                keyExtractor={(item, key) => {item.id}}
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
        height: 150,
        width: '90%',
        display: 'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems: 'center',
        borderBottomStyle:'solid',
        borderBottomColor:'black',
        borderBottomWidth: 1,
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
        flex:1,
        width: '95%',
        maxHeight: '70%',
    },
    sentMessageBlurb: {
        minHeight: 50,
        maxWidth: "45%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        backgroundColor: AppStyles.color.accent,
        marginLeft: 220,
        marginTop: 5,
        marginBottom: 5,
        padding: 10
    },
    recMessageBlurb: {
        minHeight: 50,
        maxWidth: "45%",
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        backgroundColor: AppStyles.color.description,
        marginRight: 220,
        marginTop: 5,
        marginBottom: 5,
        padding: 10,
    },
    composeBar: {
        width: '100%',
        minHeight: 60,
        backgroundColor:'black',
        marginTop:10,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around'
    },
    inputContainer: {
        width: 250,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        backgroundColor:AppStyles.color.grey,
        paddingLeft:10,
        paddingRight:10
      },
      inputBody: {
        color: 'white',
        fontFamily: AppStyles.fontFamily.regular
      },
      sendButton: {
        height: 45,
        width: 45,
        borderRadius: 25,
        backgroundColor: AppStyles.color.grey,
        alignItems:'center',
        justifyContent:'center'
      },
      sendIcon: {
        tintColor:AppStyles.color.accent,
        height: 20,
        width: 20,
      }
})
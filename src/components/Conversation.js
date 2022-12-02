import React, { useEffect, useState, useCallback } from 'react'
import {TouchableOpacity, StyleSheet, Image, ScrollView, Text, TextInput, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, AppIcon} from '../AppStyles';
import Button from 'react-native-button';
import firestore, { firebase } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { Rating } from 'react-native-ratings';
import { faPiggyBank } from '@fortawesome/free-solid-svg-icons';
import { Icon } from 'react-native-elements'

const sendIcon = require('../../assets/icons/send-icon.png')


// add a message to current conversation
function writeMessage(convoId, content, sender) {
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

const ReviewBox = (props) => {

    function leaveReview(rating) {
        firestore()
        .collection('ratings')
        .where('renterUID', '==', props.userId)
        .where('vendorUID', '==', props.friendId)
        .get()
        .then(snapshot => {
            
            if (snapshot.size == 0) {
                console.log("Leaving new rating: " + rating + " stars.");

                firestore().collection('ratings').add({
                    rating:rating,
                    renterUID: props.userId,
                    vendorUID: props.friendId,
                    review: ''
                });
            }
            else {
                console.log("Updating rating to: " + rating + " stars.");

                firestore()
                .collection('ratings')
                .doc(snapshot.docs[0].id)
                .update({
                    rating: rating
                });
            }
        });
    }

    return (
        <View style={styles.reviewBox}>
            <View style={styles.reviewBoxHeader}>
                <Text style={{color:'white', fontSize:25}}> Rate Your Experience </Text>
            </View>

            <Rating
            tintColor={"black"}
            imageSize={50}
            ratingCount={5}
            type='custom'
            ratingColor={AppStyles.color.accent}
            ratingBackgroundColor={AppStyles.color.grey}
            onFinishRating={leaveReview}
            startingValue={0}
            />

            <TouchableOpacity 
            style={styles.saveReview} 
            onPress={() => {
                props.closeFunc(false);
            }}>
                <Text style={{color:AppStyles.color.accent, fontSize:20}}> Save </Text>
            </TouchableOpacity>

        </View>
    )
}

// Screen for specific converesation with other user
const Conversation = ({navigation, route}) => {
    const [messageBuffer, setMessageBuffer] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [listRef, setListRef] = useState(null);
    const [reviewBoxVisible, setReviewBoxVisible] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    
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
                <View style={styles.backArrowView}>
                    <Icon 
                    type="ionicon" 
                    name="arrow-back-outline" 
                    color={AppStyles.color.accent} 
                    size={27} 
                    onPress={() => navigation.navigate('Messages')}></Icon>      
                </View>

                <View style={styles.friendBox}>
                    <Image source={{uri: friend?.photoURL}} style={{height: 48, width: 48, borderRadius: 48, paddingTop: 10}}/>
                    <Text style={styles.friendName}> {friend?.fullname} </Text>
                </View>
                
                <TouchableOpacity onPress={() => setReviewBoxVisible(!reviewBoxVisible)}>
                    <Text style={styles.reviewButton}>Review</Text>
                </TouchableOpacity>

            </View>

            <SafeAreaView style={styles.messageContainer}>
                <FlatList 
                data={messageList} 
                renderItem={Message} 
                keyExtractor={(item, index) => item.sentAt}
                ref={(ref) => {setListRef(ref);}}
                onContentSizeChange={() => {listRef.scrollToEnd()}}
                style={{marginVertical: 16}}
                />
            </SafeAreaView>

            <View style={styles.composeBar}>
                <View style={styles.inputContainer}>
                    <TextInput
                    style={styles.inputBody}
                    placeholder="Message"
                    value={messageBuffer}
                    onChangeText={setMessageBuffer}
                    placeholderTextColor={AppStyles.color.white}
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
                    <Image source={sendIcon} style={styles.sendIcon}/>    
                </Button>
                
            </View>
            {reviewBoxVisible && 
            <ReviewBox 
            name={friend.fullname} 
            closeFunc={setReviewBoxVisible}
            userId={user.uid}
            friendId={friend.id}
            />}
            {reviewBoxVisible &&
            <View style={styles.hidden}>
            </View>}
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
        width: '100%',
        borderBottomStyle:'solid',
        borderBottomColor: AppStyles.color.secondarybg,
        borderBottomWidth: 2
    },
    friendBox: {
        width: '50%',
        height: '50%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-evenly',
        alignItems:'center',
        marginTop: 70,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    reviewButton: {
        color:AppStyles.color.tint,

    },
    reviewBox: {
        position:"absolute",
        top: 250,
        backgroundColor:'black',
        borderColor:'white',
        borderRadius:10,
        borderWidth:1,
        height: 200,
        width: 300,
        alignItems:'center',
        zIndex: 5,
        elevation: 5
    },
    reviewBoxHeader: {
        alignItems:'center',
        borderBottomColor:AppStyles.color.grey,
        borderBottomWidth:1,
        marginBottom:30
    },
    saveReview: {
        marginTop:20
    },
    hidden: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContainer: {
        flex:1,
        width: '100%',
        maxHeight: '70%',
        backgroundColor: AppStyles.color.primarybg
    },
    sentMessageBlurb: {
        display:'flex',
        maxWidth: '50%',
        alignItems:'flex-end',
        justifyContent:'center',
        alignSelf: 'flex-end',
        borderRadius:6,
        backgroundColor: AppStyles.color.accent,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 16,
        padding: 12,
    },
    recMessageBlurb: {
        maxWidth: '50%',
        display:'flex',
        alignItems:'flex-start',
        justifyContent:'center',
        alignSelf: 'flex-start',
        borderRadius:6,
        backgroundColor: AppStyles.color.grey,
        marginRight: 200,
        marginLeft: 15,
        marginTop: 5,
        marginBottom: 5,
        padding: 12,
    },
    composeBar: {
        width: '100%',
        minHeight: 90,
        backgroundColor:AppStyles.color.primarybg,
        display: 'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        borderTopWidth: 2,
        borderTopColor: AppStyles.color.secondarybg,
    },
    inputContainer: {
        width: 280,
        height: 45,
        marginLeft: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: AppStyles.color.white,
        paddingLeft:14,
        paddingRight:14,
        paddingTop: 4
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
        borderRadius: 6,
        backgroundColor: AppStyles.color.accent,
        alignItems:'center',
        justifyContent:'center',
        marginLeft: 12
      },
      sendIcon: {
        height: 20,
        width: 20,
      },
      backArrowView: {
        position: 'absolute',
        left: 30,
        top: 82,
      },
      friendName: {
        color: AppStyles.color.white,
        fontFamily: AppStyles.fontFamily.bold,
        fontSize: AppStyles.fontSize.content,
        marginTop: 8
      },
      recMessageText: {
        color: AppStyles.color.white,
        fontFamily: AppStyles.fontFamily.regular
      },
      sentMessageText: {
        color: AppStyles.color.background,
        fontFamily: AppStyles.fontFamily.regular
      }
})
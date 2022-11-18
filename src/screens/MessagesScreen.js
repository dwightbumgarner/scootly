import React from 'react'
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import {connect, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

// Clicking a Connection opens a Conversation with another user
const Conversation = () => {

}

const MessagesScreen = () => {
    function Connection(props){

        return (
            <View style={styles.connection}>
                <View style={styles.connectionPhotoCircle}>
                    <Image source={AppIcon.images.defaultProfile}style={styles.connectionPhoto}/>
                </View>
                <View>
                    <Text style={styles.name}>Connection Name</Text>
                    <Text style={styles.lastMessage}>Latest Message</Text>
                </View>
                
            </View>
        )
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}> Messages </Text>
            <View style={styles.connectionList}>
                <Connection/>
                <Connection/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: AppStyles.color.primarybg,
        paddingBottom: 150,
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
        tintColor: 'white'
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
    }
});

export default MessagesScreen;
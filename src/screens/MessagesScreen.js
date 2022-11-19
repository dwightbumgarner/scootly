import React from 'react'
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width, AppIcon} from '../AppStyles';
import {connect, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';

// Clicking a Connection opens a Conversation with another user
//
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
                    <Text style={{color:'white', fontSize:AppStyles.fontSize.content}}>Connection Name</Text>
                    <Text style={{color:'white', }}>Latest Message</Text>
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
        paddingBottom: 100,
    },
    title: {
        fontSize: AppStyles.fontSize.title,
        fontWeight: 'bold',
        color: AppStyles.color.text,
        marginTop: 60,
        marginBottom: 20,
        textAlign: 'center',
    },
    connectionList: {
        width:'100%',
        height:'100%',
        alignItems:'center',
        borderWidth: 0.5,
        borderColor: AppStyles.color.primarybg

    },
    connection: {
        width:'90%',
        height:'13%',
        marginTop: 10,
        marginBottom: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor:AppStyles.color.accent,

        alignItems:'center',
        flexDirection:'row',
        
    },
    connectionPhotoCircle: {
        width: 70,
        height: 70,
        backgroundColor:AppStyles.color.secondarybg,
        borderRadius: 40,
        alignItems:'center',
        justifyContent:'center',
        marginLeft:15,
        marginRight:20
    },
    connectionPhoto: {
        width: 50,
        height: 50,
        tintColor:'white'
    }
});

export default MessagesScreen;
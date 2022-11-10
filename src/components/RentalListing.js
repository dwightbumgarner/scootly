import React, {useLayoutEffect, useState, useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppIcon} from '../AppStyles';
import {AppStyles, width} from '../AppStyles';
import firestore from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { ListItem, SearchBar } from "react-native-elements";
import filter from "lodash.filter";

export default function RentalListing(props) {
    const [loading, setLoading] = useState(true);
    const [rentals, setRentals] = useState([]);
    const [data, setData] = useState([]);
    const [arrayholder, setArrayHolder] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    useEffect(() => {
        firestore()
        .collection('rentals')
        .get()
        .then(collectionSnapshot => {
            console.log('Total Rentals: ', collectionSnapshot.size);
            var listings = [];
            collectionSnapshot
                .forEach(documentSnapshot => {
                    var listingData = documentSnapshot.data();
                    firestore().collection('users').doc(listingData.vendorUID).get()
                    .then(doc => {
                        const data = doc.data();
                        //console.log(doc.id, data);
                        listingData.id = documentSnapshot.id;
                        listingData.vendorName = data.fullname;
                        listingData.vendorImage = data.photoURL;
                        listingData.vendorRating = data.rating;
                        listings.push(listingData);
                        console.log('RENTAL: ', documentSnapshot.id, listingData);
                        setRentals(listings);
                        setData(rentals);
                        setArrayHolder(rentals);
                        setLoading(false);
                    })
                });
        });
    }, []);


    const renderItem = ({item}) => (
        <TouchableOpacity>
            <View style={styles.vendorMetaContainer}>
                <Image
                    style={styles.vendorImage}
                    source={{uri: item?.vendorImage}}
                />
                <View>
                    <Text style={styles.vehicleName}>{item?.vehicleName}</Text>
                    <View style={styles.subtitle}>
                        <Text style={styles.vendorName}>{item?.vendorName}</Text>
                        <Rating
                            style={{backgroundColor: AppStyles.color.primarybg}}
                            tintColor = "#1D1D1D"
                            ratingCount={5}
                            imageSize={20}
                            readonly
                            startingValue={item?.vendorRating}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.vehicleMetaContainer}>
                {console.log("RENTAL ID: ", item?.id)}
                {console.log("RENTAL: ", item)}
                <Image
                style={styles.vehicleImage}
                source={{uri: item?.vehicleImage}}
                />
                <View>
                    <Text style={styles.availability}>Availabile From {item?.availability}</Text>
                    <Text style={styles.price}>Price: ${item?.hourlyRate}/hr</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const itemSeparator = () => {
        return <View style={{ height: 30, marginHorizontal:10}} />;
    };

    if (loading) {
        return(<ActivityIndicator
          style={{marginTop: 30}}
          size="large"
          animating={loading}
          color={AppStyles.color.tint}
        />);
    }
      
    searchFunction = (text) => {
    const updatedData = arrayholder.filter((item) => {
        const item_data = `${item.vehicleName.toUpperCase()})`;
        const text_data = text.toUpperCase();
        return item_data.indexOf(text_data) > -1;
    });
    setSearchValue(text);
    setData(updatedData);
    };

    return (
        <SafeAreaView>
            <View style={{paddingBottom: 30, width: width - 20}}>
                <SearchBar
                    placeholder="What are you looking for?"
                    round
                    containerStyle={{backgroundColor: AppStyles.color.primarybg, borderTopWidth:0, borderBottomWidth:0,}}
                    inputContainerStyle={{backgroundColor: 'white'}}
                    value={searchValue}
                    onChangeText={(text) => this.searchFunction(text)}
                    autoCorrect={false}
                />
            </View>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={itemSeparator}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    vendorMetaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15
    },
    vehicleMetaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: AppStyles.color.grey, 
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 20,
        paddingBottom: 20,
        borderRadius: 20
    },
    subtitle: {
        flexDirection: "row"
    },
    vehicleImage: {
        width: 120,
        height: 120,
        borderRadius: 10,
        marginRight: 15

    },
    vendorImage: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    vehicleName: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.content,
        fontWeight: "bold",
        paddingRight: 20,
        paddingLeft: 10,
        marginBottom: 3

    },
    vendorName: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.small,
        paddingRight: 80,
        paddingLeft: 10,
        marginBottom: 7

    },
    availability: {
        color: AppStyles.color.accent,
        fontSize: AppStyles.fontSize.small,
        fontWeight: "bold",
        paddingRight: 100,
        marginBottom: 20
    },
    price: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.small,
        fontWeight: "bold",
        paddingRight: 100,
        marginBottom: 50
    },

  });

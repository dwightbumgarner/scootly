import React, {useLayoutEffect, useState, useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles, width} from '../AppStyles';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { ListItem, SearchBar } from "react-native-elements";
import filter from "lodash.filter";

const editIcon = require('../../assets/icons/edit-icon.png')

export default function VendorListing(props) {
    const auth = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [allData, setallData] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    // Here we retrieve all available rental listings
    useFocusEffect(
        React.useCallback(() => {
        // Retrieve Firebase rentals collection
        firestore()
        .collection('rentals')
        .where('vendorUID', '==', auth.user?.id)
        .get()
        .then(collectionSnapshot => {
            //console.log('Total Rentals: ', collectionSnapshot.size);
            var totalListings = collectionSnapshot.size;
            var retrievedListings = 0;
            var listings = [];
            // Loop through the rentals collection to get individual rental listings
            collectionSnapshot
                .forEach(documentSnapshot => {
                    var listingData = documentSnapshot.data(); // Store each rental's data here
                    // Retrieve Firebase users collection, we need to get information about the vendor for our rental listing
                    firestore().collection('users').doc(listingData.vendorUID).get()
                    .then(doc => {
                        const data = doc.data();
                        // Update our master listing data array with vendor info
                        listingData.id = documentSnapshot.id;
                        listingData.vendorName = data.fullname;
                        listingData.vendorImage = data.photoURL;
                        listingData.vendorRating = data.rating;
                        // Retrieve Firebase ratings collection, we need to get all ratings for our current vendor
                        firestore().collection('ratings').where('vendorUID', '==', listingData.vendorUID).get()
                        .then(collectionSnapshot => {
                            retrievedListings++;
                            var averageRating = 0;
                            var totalRatings = 0;
                            // Loop through all ratings for our current vendor to get an average
                            collectionSnapshot
                            .forEach(documentSnapshot => {
                                var ratingData = documentSnapshot.data()
                                //console.log("RATING: ", ratingData.rating);
                                averageRating += ratingData.rating;
                                totalRatings++;
                            })
                            averageRating = averageRating/totalRatings;
                            listingData.vendorRating = averageRating;
                            // At the end of all of this, we have a complete set of data for the current listing, push to the master listing data array
                            listings.push(listingData);
                            //console.log('RENTAL: ', documentSnapshot.id, listingData);
                            // We retrieved all available listings, now update state variables (need to minimize this for performance)
                            if(retrievedListings == totalListings){
                                // Here we finally have all necessary listing data
                                setData(listings);
                                setallData(listings);
                                //console.log("LISTING ARRAY: ", listings);
                                //console.log("ALL LISTINGS: ", data);
                                setLoading(false);
                            }
                        })
                    })
                });
            });
        }, [])
    );


    const renderItem = ({item}) => (
        <TouchableOpacity onPress={() => {props.navigation.navigate("EditVehicle", {itemData: item})}}>
            {<View style={styles.vendorMetaContainer}>
                <Text style={styles.vehicleName}>{item?.vehicleName}</Text>
            </View>}
            <View style={styles.vehicleMetaContainer}>
                <Image
                style={styles.vehicleImage}
                source={{uri: item?.vehicleImage}}
                />
                <View>
                    <Text style={styles.availability}>Available From {item?.availability}</Text>
                    <View style={styles.availabilityDaysContainer}>
                        <Text style={item?.availableDays.indexOf(1) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>S</Text>
                        <Text style={item?.availableDays.indexOf(2) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>M</Text>
                        <Text style={item?.availableDays.indexOf(3) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>T</Text>
                        <Text style={item?.availableDays.indexOf(4) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>W</Text>
                        <Text style={item?.availableDays.indexOf(5) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>T</Text>
                        <Text style={item?.availableDays.indexOf(6) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>F</Text>
                        <Text style={item?.availableDays.indexOf(7) > -1 ? styles.availabilityDaysActive: styles.availabilityDaysInactive}>S</Text>
                    </View>
                    <Text style={styles.price}>Price: ${item?.hourlyRate}/hr</Text>
                    <View style={styles.editCircle}>
                        <Image
                            style={{height:20, width:20, bottom: 3, right: 3}}
                            source={editIcon}
                        /></View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderNoItems = () => {
        return <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>It looks like you don't have any vehicles up and running yet. Tap the button below to add your first one!</Text>
        </View>;
    };

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
    const updatedData = allData.filter((item) => {
        const item_data = `${item.vehicleName.toUpperCase()})`;
        const text_data = text.toUpperCase();
        return item_data.indexOf(text_data) > -1;
    });
    setSearchValue(text);
    setData(updatedData);
    };

    return (
        <SafeAreaView>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={itemSeparator}
                ListEmptyComponent={renderNoItems}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    vendorMetaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '95%',
    },
    vehicleMetaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: AppStyles.color.grey, 
        padding: 20,
        borderRadius: 20,
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto'
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
    vehicleName: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.content,
        fontFamily: AppStyles.fontFamily.bold,
        paddingRight: 20,
        paddingLeft: 10,
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
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.bold,
        width: '60%',
        marginBottom: 5
    },
    availabilityDaysContainer: {
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    availabilityDaysActive: {
        color: AppStyles.color.accent,
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.bold,
    },
    availabilityDaysInactive: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.regular,
    },
    price: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.regular,
        paddingRight: 100,
        marginBottom: 12
    },
    editCircle: {
        backgroundColor: AppStyles.color.accent,
        padding: 20,
        borderRadius: 50,
        width: 55,
        height: 55,
        marginLeft: 142,
        marginTop: 85,
        position: 'absolute',
    },
    noItemsText: {
        width: '75%',
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '50%',
        color: AppStyles.color.text,
        fontFamily: AppStyles.fontFamily.regular,
        fontSize: AppStyles.fontSize.normal,
    },
  });

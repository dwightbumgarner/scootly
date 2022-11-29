import React, {useLayoutEffect, useState, useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {connect, useSelector} from 'react-redux';
import {AppStyles, width} from '../AppStyles';
import firestore from '@react-native-firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { ListItem, SearchBar } from "react-native-elements";
import filter from "lodash.filter";

export default function VendorListing(refreshKey) {
    const auth = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [allData, setallData] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    // Here we retrieve all available rental listings
    useEffect(() => {
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
    }, []);


    const renderItem = ({item}) => (
        <TouchableOpacity>
            {<View style={styles.vendorMetaContainer}>
                <Text style={styles.vehicleName}>{item?.vehicleName}</Text>
            </View>}
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
        console.log("THIS ALL LISTINGS: ", allData);
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
    vehicleName: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.content,
        fontWeight: "bold",
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

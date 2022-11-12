import React, {useState, useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {AppStyles, width} from '../AppStyles';
import firestore from '@react-native-firebase/firestore';
import { Rating } from 'react-native-ratings';
import { SearchBar } from "react-native-elements";

export default function RentalListing(props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [allData, setallData] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const searchIcon = require('../../assets/icons/search.png');

    // Here we retrieve all available rental listings
    useEffect(() => {
        // Retrieve Firebase rentals collection
        firestore()
        .collection('rentals')
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
            <View style={styles.vendorMetaContainer}>

                <View style={styles.vendorMetaSubcontainer}>
                    <Image
                        style={styles.vendorImage}
                        source={{uri: item?.vendorImage}}
                    />
                    <View>
                        <Text style={styles.vehicleName}>{item?.vehicleName}</Text>
                        <Text style={styles.vendorName}>{item?.vendorName}</Text>
                    </View>
                </View>
                
                <Rating
                    tintColor = "#1D1D1D"
                    ratingCount={5}
                    imageSize={16}
                    readonly
                    startingValue={item?.vendorRating}
                    type='custom'
                    ratingColor={AppStyles.color.accent}
                    ratingBackgroundColor={AppStyles.color.text}
                    style={styles.rating}
                />
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
            <View>
                <SearchBar
                    placeholder="Search for a vehicle"
                    style={styles.searchBar}
                    containerStyle={styles.searchBarContainer}
                    inputContainerStyle={styles.searchBarInput}
                    value={searchValue}
                    onChangeText={(text) => searchFunction(text)}
                    autoCorrect={false}
                    placeholderTextColor={AppStyles.color.secondarytext}
                    searchIcon={{color: AppStyles.color.text}}
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
        marginBottom: 15,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '90%',
    },
    vendorMetaSubcontainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    vehicleMetaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: AppStyles.color.secondarybg, 
        padding: 20,
        borderRadius: 12,
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    subtitle: {
        flexDirection: "row"
    },
    vehicleImage: {
        width: 130,
        height: 130,
        borderRadius: 12,
        marginRight: 20
    },
    vendorImage: {
        width: 48,
        height: 48,
        borderRadius: 50,
        marginRight: 12,
    },
    vehicleName: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.content,
        fontFamily: AppStyles.fontFamily.bold,
        fontWeight: "bold",
        marginBottom: 6,
    },
    vendorName: {
        color: AppStyles.color.secondarytext,
        fontSize: AppStyles.fontSize.small,
        fontFamily: AppStyles.fontFamily.bold,
        textTransform: 'uppercase',
        marginBottom: 7,
    },
    availability: {
        color: AppStyles.color.accent,
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.bold,
        width: '70%',
        marginBottom: 20
    },
    price: {
        color: AppStyles.color.white,
        fontSize: AppStyles.fontSize.normal,
        fontFamily: AppStyles.fontFamily.regular,
        paddingRight: 100,
        marginBottom: 50
    },
    searchBar: {
        fontFamily: AppStyles.fontFamily.regular,


    },
    searchBarContainer: {
        backgroundColor: AppStyles.color.primarybg, 
        paddingBottom: 30,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    searchBarInput: {
        backgroundColor: AppStyles.color.secondarybg, 
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: AppStyles.color.white,
        borderRadius: 8,
        width: '95%',
    },
    rating: {
        justifySelf: 'flex-end'
    }
  });

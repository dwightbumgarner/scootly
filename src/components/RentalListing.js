import React, {useState, useEffect} from 'react';
import {Animated, TouchableOpacity, StyleSheet, Image, Text, View, FlatList, SafeAreaView, ActivityIndicator, Modal} from 'react-native';
import {AppStyles, width} from '../AppStyles';
import firestore from '@react-native-firebase/firestore';
import { Rating } from 'react-native-ratings';
import { SearchBar } from "react-native-elements";
import {RadioButton} from 'react-native-paper';
import {SelectList} from 'react-native-dropdown-select-list'

export default function RentalListing(props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [allData, setallData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    //MODAL
    const[animation, setAnimation]=useState(new Animated.Value(1));     //debug change to 0
    const openModal = animation.interpolate({
            inputRange: [0,1],
            outputRange: [0,1],
            extrapolate: "clamp",
        });

    //RADIOBUTTONS - set default values that will guarantee all data to show
    const [checkedProx, setCheckedProx] = React.useState('50')
    const [checkedPrice, setCheckedPrice] = React.useState('1000')
    const [checkedRev, setCheckedRev] = React.useState('0')

    //DROPDOWN - set default values that will guarantee all data to show
    const [startSelected, setSSelected] = React.useState('01:00 AM');
    const [endSelected, setESelected] = React.useState('11:00 PM');
    const timeData = [
        {key:'1', value:'12:00 AM'},
        {key:'2', value:'01:00 AM'},
        {key:'3', value:'02:00 AM'},
        {key:'4', value:'03:00 AM'},
        {key:'5', value:'04:00 AM'},
        {key:'6', value:'05:00 AM'},
        {key:'7', value:'06:00 AM'},
        {key:'8', value:'07:00 AM'},
        {key:'9', value:'08:00 AM'},
        {key:'10', value:'09:00 AM'},
        {key:'11', value:'10:00 AM'},
        {key:'12', value:'11:00 AM'},
        {key:'13', value:'12:00 PM'},
        {key:'14', value:'01:00 PM'},
        {key:'15', value:'02:00 PM'},
        {key:'16', value:'03:00 PM'},
        {key:'17', value:'04:00 PM'},
        {key:'18', value:'05:00 PM'},
        {key:'19', value:'06:00 PM'},
        {key:'20', value:'07:00 PM'},
        {key:'21', value:'08:00 PM'},
        {key:'22', value:'09:00 PM'},
        {key:'23', value:'10:00 PM'},
        {key:'24', value:'11:00 PM'},
    ];



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
                    <Text style={styles.availability}>Available From {item?.availability}</Text>
                    <Text style={styles.price}>Price: ${item?.hourlyRate}/hr</Text>
                    <Text style={styles.proximity}>Proximity: {item?.proximity} miles</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const itemSeparator = () => {
        return <View style={{ height: 30, marginHorizontal:10}} />;
    };


//MODAL FUNCTIONALITY
    const modalTrigger=()=>{
        Animated.timing(animation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const filterFunction = () => {
        console.log("Data being filtered");
        console.log(startSelected)
        console.log(endSelected)

        const updatedData = allData.filter((item) =>
            item.hourlyRate < checkedPrice &&
            item.vendorRating >= checkedRev &&
            item.proximity <= checkedProx &&
            (
                ((item.availability).substring(0,item.availability.indexOf(" - ")) >= startSelected &&
                (item.availability).substring(item.availability.indexOf(" - ") + 3, item.availability.length) <= endSelected)
            ||
                ((item.availability).substring(0,item.availability.indexOf(" - ")) <= startSelected &&
                (item.availability).substring(item.availability.indexOf(" - ") + 3, item.availability.length) >= endSelected)
            )
        );
        setData(updatedData);

    };

    const close=()=>{
        Animated.timing(animation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
        }).start();
        filterFunction();
    };

    const open={
        transform: [
            {scale:openModal},
        ]
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
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 5}}>
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
                    <View style={{flex: 1}}>
                        <TouchableOpacity
                            onPress={modalTrigger}
                            style={styles.button}>
                                  <Text> *** </Text>
                        </TouchableOpacity>
                    </View>
               </View>
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={itemSeparator}
                />
                <Animated.View style={[styles.background, open]} pointerEvents="box-none">
                    <View style={[styles.modal]}>
                      <View style={{flexDirection:"row", justifyContent:'center', marginBottom: 30}}>
                          <Text style={[ styles.modalFilter]}> Filter </Text>
                          <TouchableOpacity onPress={close} style={styles.modalButton}>
                              <Text> X </Text>
                          </TouchableOpacity>
                      </View>

                      <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText]}> Proximity </Text>
                        <View style={{flexDirection:"row"}}>
                            <View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="0.05"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '0.05' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('0.05')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}0.05 miles </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="0.1"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '0.1' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('0.1')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}0.1 miles </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="0.2"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '0.2' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('0.2')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}0.2 miles </Text>
                                </View>
                            </View>
                            <View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="0.3"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '0.3' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('0.3')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}0.3 miles </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="0.5"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '0.5' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('0.5')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}0.5 miles </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="1"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedProx === '1' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedProx('1')}
                                    />
                                    <Text style={styles.modalNormal}> {'< '}1 miles </Text>
                                </View>
                            </View>

                        </View>
                      </View>



                      <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText]}> Price </Text>
                        <View style={{flexDirection:"row"}}>
                            <View style={{marginRight: 25}}>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="5"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedPrice === '5' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedPrice('5')}
                                    />
                                    <Text style={styles.modalNormal}> {'< $'}5/hr </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="10"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedPrice === '10' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedPrice('10')}
                                    />
                                    <Text style={styles.modalNormal}> {'< $'}10/hr </Text>
                                </View>
                            </View>
                            <View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="15"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedPrice === '15' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedPrice('15')}
                                    />
                                    <Text style={styles.modalNormal}> {'< $'}15/hr </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="20"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedPrice === '20' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedPrice('20')}
                                    />
                                    <Text style={styles.modalNormal}> {'< $'}20 miles </Text>
                                </View>
                            </View>

                        </View>
                      </View>



                      <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText]}> Reviews </Text>
                        <View style={{flexDirection:"row"}}>
                            <View style={{marginRight: 45}}>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="4.75"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedRev === '4.75' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedRev('4.75')}
                                    />
                                    <Text style={styles.modalNormal}> 4.75+ </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="4.5"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedRev === '4.5' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedRev('4.5')}
                                    />
                                    <Text style={styles.modalNormal}> 4.5+ </Text>
                                </View>
                            </View>
                            <View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="4"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedRev === '4' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedRev('4')}
                                    />
                                    <Text style={styles.modalNormal}> 4+ </Text>
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <RadioButton.Android
                                        value="3"
                                        color={AppStyles.color.accent}
                                        uncheckedColor={AppStyles.color.white}
                                        uncheckedColor={AppStyles.color.white}
                                        status={checkedRev === '3' ? 'checked' : 'unchecked'}
                                        onPress={() => setCheckedRev('3')}
                                    />
                                    <Text style={styles.modalNormal}> 3+ </Text>
                                </View>
                            </View>

                        </View>
                      </View>

                      <View>
                        <Text style={[styles.modalText]}> Availability </Text>
                        <SelectList
                            data={timeData}
                            setSelected={(val) => setSSelected(val)}
                            save="value"
                            dropdownTextStyles={{color:AppStyles.color.accent}}
                            placeholder="Select Start Time"
                            inputStyles={{color:AppStyles.color.accent}}
                            fontFamily={AppStyles.fontFamily.regular}
                        />
                        <Text> </Text>
                        <SelectList
                            data={timeData}
                            setSelected={(val) => setESelected(val)}
                            save="value"
                            boxStyles={{color:AppStyles.color.accent}}
                            dropdownTextStyles={{color:AppStyles.color.accent}}
                            placeholder="Select End Time"
                            inputStyles={{color:AppStyles.color.accent}}
                            boxStyles={{color:AppStyles.color.accent}}
                            fontFamily={AppStyles.fontFamily.regular}
                        />
                      </View>

                    </View>
                </Animated.View>
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
        width: '95%',
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
        marginBottom: 20
    },
    proximity: {
            color: AppStyles.color.white,
            fontSize: AppStyles.fontSize.normal,
            fontFamily: AppStyles.fontFamily.regular,
            width: '80%',
            marginBottom: 20
        },
    searchBar: {
        fontFamily: AppStyles.fontFamily.regular,


    },
    searchBarContainer: {
        backgroundColor: AppStyles.color.primarybg,
        paddingBottom: 30,
        borderTopWidth: 0,
        borderWidth: 1,
        borderBottomWidth: 0,
        marginLeft: 10,
        marginRight: 0,
        width: '85%',
        marginHorizontal: 0
    },
    searchBarInput: {
        backgroundColor: AppStyles.color.secondarybg,
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: AppStyles.color.white,
        borderRadius: 8,
        width: '85%',
    },
    rating: {
        justifySelf: 'flex-end'
    },
    modalButton: {
        marginTop: 0,
        alignSelf: 'flex-end',                  //moves x to right
        flex: 1,
        flexDirection: 'row-reverse',
    },
    modalFilter: {
        fontFamily: AppStyles.fontFamily.bold,
        fontSize: AppStyles.fontSize.title,
        color: AppStyles.color.white,
        position: "absolute",
    },
    modalText: {
        textAlign: "left",
        fontFamily: AppStyles.fontFamily.bold,
        fontSize: AppStyles.fontSize.content,
        color: AppStyles.color.white,
        marginBottom: 8,
    },
    modalNormal: {
        fontFamily: AppStyles.fontFamily.regular,
        fontSize: AppStyles.fontSize.normal,
        color: AppStyles.color.white,
        marginTop: 2,
    },
    modal: {
        padding: 30,
        borderRadius: 8,
        marginBottom: 300,
        backgroundColor: AppStyles.color.secondarybg,
        justifySelf: 'center',
    },
    button: {
        backgroundColor: AppStyles.color.secondarybg,
        borderColor: AppStyles.color.white,
        borderWidth: 1,
        borderRadius: 8,
        paddingBottom: 30,
    },
    background: {                   //regular items
        position: "absolute",
        left: 0,
        right: 0,
        top:0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    dropdown: {
        paddingBottom: 5,
        fontFamily: AppStyles.fontFamily.bold,
        fontSize: AppStyles.fontSize.title,
        color: AppStyles.color.secondarytext,
    },
  });

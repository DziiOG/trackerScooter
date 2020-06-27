import Geolocation from "@react-native-community/geolocation";
import { Alert } from "react-native";
import geolib from 'geolib';
import React from 'react';
import { View, Text } from 'react-native'
import axios from 'axios';


var LATITUDE = 6.655100;
var LONGITUDE = -1.546730;

class Location extends React.Component{
    
    constructor(props){
        super(props)

        this.state = {
            newLatitude: LATITUDE,
            newLongitude: LONGITUDE,
            latitude: LATITUDE,
            longitude: LONGITUDE,
            error: ' '
        }
    }

    sendToFirebase = () => {
        //console.log(this.state)

        const URL = `https://gpstracker-89342.firebaseio.com/coordinates.json`

        axios({
            method: "POST",
            url: URL,
            data: this.state
        }).then( response => console.log(response.data))

    }

    componentDidMount() {
        this.getLocation(); //Get User current Location
    }
   /* 
    componentDidUpdate(prevProps, prevState) {
        if(prevState.newLatitude !== this.state.newLatitude) 
        {
           //If previous latitude is not equal to new latitude get distance
            this.getDistance();
        }
    }
    */
    componentWillUnmount() {
        //clearing all listeners
        Geolocation.clearWatch(this.watcher);
    }
    
    componentDidUpdate(prevProps, prevState){
        //this.getLocation();
        this.watchUserPosition();
        if(prevState.newLatitude !== this.state.newLatitude){
            this.getLocation();
        }
        //console.log(this.state);
       // console.log(prevState);

    }
    
    getLocation(){
        Geolocation.getCurrentPosition((position) => {
            this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                
                //this.sendToFirebase();
                this.watchUserPosition(); //Continue Listening for any changes in Location
                console.log(this.state)
            });
        }, (error) => {
            //Handling Error
            console.log(error);
        }, 
        { enableHighAccuracy: true, timeout: 200000, maximumAge: 100},
        );
    }
    
    watchUserPosition(){
        this.watcher = Geolocation.watchPosition(
            (position) => {
                this.setState({
                    newLatitude: position.coords.latitude,
                    newLongitude: position.coords.longitude,
                    error: null,
                });
            },
            (error) => this.setState({error: error.message}),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 10 },
        );
    }
    
    /*
    getDistance(){
        let initial = {
            latitude: this.state.latitude, 
            longitude: this.state.longitude};
    
        let newCoord = {
            latitude: this.state.newLatitude,
            longitude: this.state.newLongitude
        };
    
        const distance = geolib.getDistance(initial, newCoord);
    
        if (distance >= 100){
            Alert.alert("Success", "You have 100 meters!");
           // this.sendToFirebase(); // send the meters to firebase
        }
    }
*/
    render(){
        return(
            <View>
                <Text>Hi</Text>
            </View>
        )
    }
}

export default Location;
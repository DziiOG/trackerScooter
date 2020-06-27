/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */


import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Dimensions
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  PROVIDER_GOOGLE
} from "react-native-maps";
import haversine from "haversine";
import Geolocation from '@react-native-community/geolocation';
import Location from "./src/main";
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import { Container, Header, Content, Form, Item, Picker, ListItem , List} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome'


var LATITUDE = 6.655100;
var LONGITUDE = -1.546730;
const LATITUDE_DELTA = 0.009202;
const LONGITUDE_DELTA = 0.004201;
//var LATITUDE; 
//var LONGITUDE; 

const height = Dimensions.get('screen').height;

class AnimatedMarkers extends React.Component{


  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      text: 'http://facebook.github.io/react-native/',
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }),
      ButtonToGenerateQrCode: false,
      scooterId: 1,
      selected2: undefined,
      allscooters: [
       
      ], 
      modal: false
    };
  }

  getScootersFromFireBase = () => {
    axios.get("https://us-central1-halo-84fb8.cloudfunctions.net/api/scooters").then(response => {
      console.log(
        response.data
      );

      this.setState({
        allscooters: response.data
      });
    }).catch(error => {
      console.log(error);
    })
  }

  
  sendToFirebase = (data) => {
    //console.log(this.state)
    
    const URL = `https://gpstracker-89342.firebaseio.com/TrackPositions2.json`
    const URL2 = `https://us-central1-halo-84fb8.cloudfunctions.net/api/scooter`


    axios.put(URL2, {
      InUse: false,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      scooterId: this.state.scooterId
    })
    .then((response) => {
      console.log(response.data)
    })

    axios({
        method: "POST",
        url: URL,
        data: data
    }).then( response => console.log(response.data))




}
renderScooter = ( item ) => {
  
}



componentDidUpdate(prevProps, prevState, snapShot){

  console.log(prevState);
  
  //this.sendToFirebase(prevState);
  this.sendToFirebase(this.state)
}

getLocation(){
  Geolocation.getCurrentPosition((position) => {
      this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
      }, () => {
          
          this.sendToFirebase(this.state);
          console.log(this.state);
          
          
      });
  }, (error) => {
      //Handling Error
      console.log(error);
  }, 
  { enableHighAccuracy: false, timeout: 200000, maximumAge: 100},
  );
}

 
  

  componentDidMount() {
    this.getScootersFromFireBase();
  

    this.getLocation();

    const { coordinate } = this.state;

    this.watchID = Geolocation.watchPosition(
      position => {
        const { routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude
        };

        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10
      }
    );
    
    //console.log(this.state)
    this.sendToFirebase(this.state);
    console.log(this.getMapRegion());
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
    
    
  }
  generateQrcode= () => {
    if(this.state.ButtonToGenerateQrCode == false){

      this.setState({
        ButtonToGenerateQrCode: true
      })
    }else{
      this.setState({
        ButtonToGenerateQrCode: false
      })
    }
  }
  onValueChange2(value) {
    this.setState({
      selected2: value
    });
  }

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };

  render() {
    return (
      this.state.allscooters.length == 0 ? <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
      }}>
        <ActivityIndicator size="large" color="#5cccee">

        </ActivityIndicator>
      </View> :
      <View style={styles.container}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={this.getMapRegion()}
        >
          <Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />
          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.coordinate}
          />
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]} onPress={()=> {this.generateQrcode()}}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
            <Text>
              Press To Generate QRCode
            </Text>
          </TouchableOpacity>

          {
            (this.state.ButtonToGenerateQrCode) &&

            <TouchableOpacity onPress={()=> {
              this.setState({
                ButtonToGenerateQrCode: false
              })
            }} style={{marginRight: 54, marginBottom:150}}>
              
            <QRCode
            value="Just Some String Value"
            size={400}
            >

            </QRCode>
            </TouchableOpacity> 
          }
        </View>
        <View style={styles.buttonContainer2}>
          <TouchableOpacity style={[styles.bubble, styles.button, {backgroundColor: "#00ff00"}]} onPress={()=> {this.setState({
            modal:true
          })}}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
            <Text>
              Press to Select Scooter to Control
            </Text>
          </TouchableOpacity>

          
        </View>
        <Modal visible={this.state.modal} animated={true} animationType="slide">
         
            <View keyboardShouldPersistTaps="always">
            <List 
                    dataArray={this.state.allscooters}
                    keyboardShouldPersistTaps="always"
					renderRow={(item)=>
						
                            <ListItem 
                            keyboardShouldPersistTaps="always"
                            onPress={()=>{ 
                                  this.setState({
                                    scooterId: item.scooterId,
                                    modal: false
                                  });

                                  alert(`Scooter ${item.scooterId} selected`);
                            }}
                             button avatar>
                                
                                <View style={{
                                  margin: 15
                                }}>
                                     <Text>Scooter {item.scooterId}</Text>
                                </View>
							</ListItem>
						
                    }
                    keyExtractor={item => item.scooterId}
				/>
          </View>
        </Modal>
     
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    height: height * 0.633

  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "#5cccee",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
    bottom: -110,
    position: "absolute"
  },
  buttonContainer2: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
    bottom: -200,
    position: "absolute"
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
    padding: 5,
  }
});

export default AnimatedMarkers;
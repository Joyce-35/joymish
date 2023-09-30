import * as Location from "expo-location";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const Worker = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [workers, setworkers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          setIsAuthenticated(true);

          const db = getFirestore();
          const workersCollection = collection(db, "workers");
          const querySnapshot = await getDocs(
            query(workersCollection, where("id", "==", currentUser.uid))
          );

          const workersData = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });

          setworkers(workersData);

          // Fetch profile image URL for the current user
          if (workersData.length > 0 && workersData[0].profileImageUrl) {
            setProfileImageUrl(workersData[0].profileImageUrl);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching workers:", error);
      }
    };

    fetchClientData();
  }, []);

  useEffect(() => {
    const fetchUserLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    fetchUserLocation();
  }, []);


  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.firstContainer}>
       

          <View style={styles.profileContainer}>
          <View style={styles.nameCon}>
            <Text style={styles.name}>
            {workers.length > 0 ? workers[0].fullName : "Worker Name"}
            </Text>
            </View>
            <View style={styles.profileContainer2}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.profile}
                />
              ) : (
                <View style={styles.imgContainer}>
                  <Image
                    source={require("../../../assets/images/user1.png")}
                    style={styles.profile}
                  />
                </View>
              )}
            </View>
          </View>
          {location ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Your Location"
              />
            </MapView>
          ) : (
            <Text style={styles.locationText}>Fetching location...</Text>
          )}
        </View>
        <View style={styles.SecondContainer}>
          <View style={styles.gridContainer}>
          <TouchableOpacity
              style={styles.gridItem}
              onPress={() => {
                navigation.navigate("Browse")
              }}
            >
            <View style={styles.gridItem}>
              <Image source={require("../../../assets/images/washing.png")} />
              <Text style={styles.serviceTitle}>Laundry</Text>
              <Text style={styles.serviceDescription}>
                High-quality washing and expert ironing services to keep your
                clothes looking fresh and neat.
              </Text>
           
        
            </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => {
                navigation.navigate("Browse")
              }}
            >
            <View style={styles.gridItem}>
              <Image source={require("../../../assets/images/iron.png")} />
              <Text style={styles.serviceTitle}>Ironing</Text>
              <Text style={styles.serviceDescription}>
                Professional ironing services to ensure your clothes are
                wrinkle-free and ready to wear.
              </Text>
            </View>
            </TouchableOpacity>
          </View>
          <View style={styles.gridContainer}>
          <TouchableOpacity
              style={styles.gridItem}
              onPress={() => {
                navigation.navigate("Browse")
              }}
            >
            <View style={styles.gridItem}>
              <Image source={require("../../../assets/images/cleaning.png")} />
              <Text style={styles.serviceTitle}>Dry Cleaning</Text>
              <Text style={styles.serviceDescription}>
                Professional dry cleaning services for delicate and special
                garments, leaving them fresh and spotless.
              </Text>
            </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => {
                navigation.navigate("Browse")
              }}
            >
            <View style={styles.gridItem}>
              <Image source={require("../../../assets/images/daring.png")} />
              <Text style={styles.serviceTitle}>General Cleaning</Text>
              <Text style={styles.serviceDescription}>
                Thorough and comprehensive general cleaning services to make
                your space sparkle and shine.
              </Text>
            </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  locationText: {
    fontSize: 18,
    color:'white',
  },
  profile: {
    height: "100%",
    width: "100%",
    borderRadius: 50,
  },
  profileContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  profileContainer2: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginLeft: "30%",
  },
  imgContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
  },

  map: {
    width: "100%",
    height: 230,
    position: "absolute",
    bottom: 42,
    alignSelf: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: "100%",
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    alignSelf:'center',
    marginBottom:10,
    color: "#3abbd7",
  },
  name: {
    fontSize: 22,
    marginLeft: 10,
    color: "white",
    fontWeight: "bold",
    fontFamily: "serif",
  },
  firstContainer: {
    width: "100%",
    height: 360,
    backgroundColor: "#3abbd7",
    alignSelf: "center",
  },
  SecondContainer: {
    marginTop: 20,
    width: "100%",
    height: 400,
    backgroundColor: "#d5d7e3",
    alignSelf: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "relative",
    bottom: 60,
    flexDirection: "row", // Arrange items horizontally
    justifyContent: "space-between",
    paddingTop:16,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "column", // Arrange items vertically within each column
    justifyContent: "space-between", // Evenly distribute space between items
    paddingHorizontal: 10,
    
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  bookContainer: {
    width: "90%",
    backgroundColor: "red",
    height: 400,
    alignSelf: "center",
    marginTop: 0,
  },
  serviceDescription:{
    paddingHorizontal:3,
    textAlign:"center",
    fontSize:12,
  },
  serviceTitle:{
    fontSize:16,
    fontWeight:'bold',
    paddingVertical:2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  nameCon: {
    width:200,
    alignSelf:'flex-start'
  },
  name: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    fontFamily: "serif",
    width:200,
    textAlign:"center",
  },
});

export default Worker;

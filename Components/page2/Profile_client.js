import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Dimensions, RefreshControl, StyleSheet, View } from 'react-native';
import Client from '../otherComponent/Client';
import Worker from '../otherComponent/Worker';

const { width } = Dimensions.get('window');

const ProfileClient = ({navigation}) => {
  const [userType, setUserType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const fetchUserType = async () => {
      try {
        // Attach the event listener for the back button

        // Fetch the current user's email
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const db = getFirestore();
          const clientsCollection = collection(db, "clients");

          // Check if the current user's email exists in the clients collection
          const querySnapshot = await getDocs(
            query(clientsCollection, where("id", "==", currentUser.uid))
          );

          if (!querySnapshot.empty) {
            setUserType("client");
          } else {
            setUserType("worker");
          }
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      } finally {
        // Remove the event listener when the component is unmounted
      }
    };

    fetchUserType();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Perform the actions you want to do when refreshing here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // Simulate refreshing for 1 second
  };
  return (
    <View style={styles.container}   refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> }>
    
      
    {userType === "client" ? <Client navigation={navigation} refreshing={refreshing} /> : <Worker navigation={navigation} refreshing={refreshing} />}
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: width, // Occupy full width of the screen
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // To account for the height of the navbar
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3abbd7',
    borderRadius: 50,
    height: 45,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
    color:'#3abbd7',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  overlap: {
    backgroundColor: '#3abbd7',
    height: 47,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:20,
  },
  textWrapper: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  navBar: {
    backgroundColor: "#fff",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 20,
    paddingBottom: 5,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navIconContainer: {
    alignItems: "center",
  },
  navIconLabel: {
    fontSize: 12,
    color: "#3abbd7",
    marginTop: 4,
  },
});

export default ProfileClient;

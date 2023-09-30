import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  View
} from "react-native";
import Client from "../otherComponent/Home/Client";
import Worker from "../otherComponent/Home/Worker";

const { width } = Dimensions.get("window");
const windowWidth = Dimensions.get("window").width;
const HomePage = ({ navigation }) => {
  const [userType, setUserType] = useState(null);

  const handleBackButton = () => {
    return true; // Prevent navigation
  };

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        // Attach the event listener for the back button
        BackHandler.addEventListener("hardwareBackPress", handleBackButton);

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
        BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
      }
    };

    fetchUserType();
  }, []);
  return (
    <View style={styles.container}>
       {userType === "client" ? <Client navigation={navigation} /> : <Worker navigation={navigation} />}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    width: width,
  },
  image1: {
    height: 150,
  },
  home: {
    width: "95%",
    alignSelf: "center",
    height:500,
  },
  App: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#3abbd7",
  },
  scrollContent: {
    flexGrow: 1, // Allow content to expand vertically
  },
  slide: {
    width: windowWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#3abbd7",
    position: "absolute",
    top: 250,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // To account for the height of the navbar
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3abbd7",
    borderRadius: 50,
    height: 45,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
    color: "#3abbd7",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  overlap: {
    backgroundColor: "#3abbd7",
    height: 47,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  textWrapper: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  HomePage2: {
    height: 100,
    marginTop: 30,
  },
  HomePage3: {
    flexDirection: "row",
    backgroundColor: "red",
    width: "100%",
    height: 150,
    marginTop:30,
  },
  HomePage1:{
    marginBottom:20,
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

export default HomePage;

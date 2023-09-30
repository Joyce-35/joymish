import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ClientBookings from './ClientBooking';
import WorkerRequest from './WorkerRequest';

const Request = () => {
  const [userType, setUserType] = useState(null);
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
    return (
        <View style={styles.container}>
          <View style={styles.Request}>
            {userType === "client" ? <ClientBookings /> : <WorkerRequest/>}
          </View>
           
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems:'center',
        backgroundColor:'#e8e9eb'
      },
      overlap: {
        backgroundColor: '#3abbd7',
        height: 47,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:20,
        width:'100%'
      },
      textWrapper: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '700',
      },
      Request:{
        flex:1,
        width:"100%",
        marginTop:20,

      }
})
export default Request;


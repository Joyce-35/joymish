import { Entypo } from '@expo/vector-icons';
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";



const ClientBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
  
    const fetchBookings = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("User not authenticated.");
          return;
        }
  
        const db = getFirestore();
        const bookingsCollection = collection(db, "bookings");
  
        // Query the bookings collection where clientEmail matches the current user's email
        const querySnapshot = await getDocs(
          query(bookingsCollection, where("clientId", "==", currentUser.uid))
        );
  
        const bookingsData = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
  
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    useEffect(() => {
      fetchBookings();
    }, []);
    const handleComplete = async (workerId) => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const db = getFirestore();
    
        // Query the bookings collection where the clientId matches the current user's ID
        const bookingQuerySnapshot = await getDocs(
          query(collection(db, 'bookings'), where('clientId', '==', currentUser.uid))
        );
    
        if (!bookingQuerySnapshot.empty) {
          const bookingDoc = bookingQuerySnapshot.docs[0];
          const bookingData = bookingDoc.data();
    
          // Update the booking status to completed
          await updateDoc(bookingDoc.ref, {
            status: 'Completed',
          });
          console.log("marked completed for", currentUser.uid)
    
          // Get the workerId from the booking data
          const workerID = bookingData.workerId;
          console.log(workerID);
    
          // Query the workers collection to find the worker with the matching ID
          const workersQuerySnapshot = await getDocs(
            query(collection(db, 'workers'), where('id', '==', workerID))
          );
    
          if (!workersQuerySnapshot.empty) {
            const workerDoc = workersQuerySnapshot.docs[0];
    
            // Increment the NumberOfCompleted field by one
            const currentNumberOfCompleted = workerDoc.data().NumberOfCompleted || 0;
            const currentNumberOfBookings = workerDoc.data().bookings || 0;
            await updateDoc(workerDoc.ref, {
              NumberOfCompleted: currentNumberOfCompleted + 1,
              bookings: currentNumberOfBookings - 1, // Decrement bookings by one
            });
    
            // Decrement the bookings field by one in the client's document
            const clientId = bookingData.clientId;
            const clientsCollection = collection(db, 'clients');
            const clientsQuerySnapshot = await getDocs(
              query(clientsCollection, where('id', '==', currentUser.uid))
            );
    
            if (!clientsQuerySnapshot.empty) {
              const clientDoc = clientsQuerySnapshot.docs[0];
              const currentBookings = clientDoc.data().bookings || 0;
    
              await updateDoc(clientDoc.ref, {
                bookings: currentBookings - 1,
              });
            }
    
            alert('Work Completed');
            handleRefresh();
          } else {
            console.error('Worker not found with id:', workerId);
          }
        }
      } catch (error) {
        console.error('Error marking as completed:', error);
      }
    };
    
    
    
    
      const handleAbort = async (workerId) => {
        try {
          const auth = getAuth();
          const currentUser = auth.currentUser;
          const db = getFirestore();
      
          // Query the bookings collection where the workerId matches the worker's email
          const bookingQuerySnapshot = await getDocs(
            query(collection(db, 'bookings'), where('clientId', '==', currentUser.uid))
          );
      
          if (!bookingQuerySnapshot.empty) {
            const bookingId = bookingQuerySnapshot.docs[0].id;
            const bookingRef = doc(db, 'bookings', bookingId);
      
            // Update the booking status to completed
            await deleteDoc(bookingRef);

            const workersCollection = collection(db, 'clients');
            const workerQuery = query(workersCollection, where('id', '==', currentUser.uid));
            const workerSnapshot = await getDocs(workerQuery);
   
            if (!workerSnapshot.empty) {
              const workerDoc = workerSnapshot.docs[0];
              const workerBookings = workerDoc.data().bookings || 0;
   
              await updateDoc(workerDoc.ref, {
                bookings: workerBookings - 1,
              });
              console.log("client books decreased ")



            alert("You cancelled the appointed")
            handleRefresh();


          } else {
            console.error('Booking not found for worker:', workerId);
          }}
        } catch (error) {
          console.error('Error marking as Rejected:', error);
        }
      };

      
      const renderBookings = bookings.filter((booking) => booking.status === "Accepted");
      const handleRefresh = () => {
        setRefreshing(true);
        fetchBookings(); // Fetch the bookings again
        setRefreshing(false);
      };


      const renderNoBookingsMessage = () => {
        if (renderBookings.length === 0) {
          return (
            <View style={styles.noBookingsContainer}>
              <Text style={styles.noBookingsText}>No bookings to display.</Text>
            </View>
          );
        }
        return null;
      };
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.workerProfileImage}}
        style={styles.profileImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.workerName}</Text>
        <View style={styles.locCon}>
        <Entypo name="location-pin" size={24} color="black" />
        <Text style={styles.location}>{item.workerlocation}</Text>
        </View>
        
      </View>
      <View>
      <TouchableOpacity onPress={() => handleComplete(item.id)}style={styles.acceptButton} >
        <Text style={styles.acceptButtonText}>completed</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleAbort(item.id)} style={styles.rejectButton}>
        <Text style={styles.rejectButtonText}>Abort</Text>
      </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
          <FlatList
        data={renderBookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
       {renderNoBookingsMessage()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: wp("2%"),
},
itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius:10
},
profileImage: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: 100,
},
infoContainer: {
    flex: 1,
    marginLeft: wp("1%"),
},
name: {
    fontSize: wp("4%"),
    fontWeight: 'bold',
    marginLeft: wp("3%"),
},
location: {
    fontSize: wp("2%"),
    fontWeight: 'bold',
    marginLeft: wp("1%"),
},
acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: wp("3%"),
},
rejectButtonText: {
    color: '#3abbd7',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: wp("3%"),
},
acceptButton: {
    fontWeight: 'bold',
    marginRight: wp("2%"),
    width: wp("25%"),
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#3abbd7',
    height: hp("4%"),
    justifyContent: 'center',
},
rejectButton: {
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: "#3abbd7",
    width: wp("25%"),
    borderRadius: 5,
    height: hp("4%"),
    justifyContent: 'center',
    marginTop:10
},
locCon: {
    flexDirection: 'row',
    marginLeft: wp("3%"),
    marginTop: hp("1%"),
},
noBookingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
noBookingsText: {
    fontSize: wp("4%"),
    fontWeight: 'bold',
},
});

export default ClientBookings;

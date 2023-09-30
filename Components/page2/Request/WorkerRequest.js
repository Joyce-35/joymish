import { Entypo, FontAwesome } from '@expo/vector-icons';
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
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const WorkerRequest = () => {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [clientID, setClientId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

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
        query(bookingsCollection, where("workerId", "==", currentUser.uid))
      );

      const bookingsData = querySnapshot.docs.map((doc) => {
        const booking = { id: doc.id, ...doc.data() };
        // Fetch the clientId field and store it as a variable
        const clientId = booking.clientId;
        // Set the clientId state variable
        setClientId(clientId);
        return { ...booking, clientId };
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (workerId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const db = getFirestore();
      const ClientId = clientID; // Correct the variable name
      
      // Query the bookings collection where the workerId matches the worker's email
      const bookingQuerySnapshot = await getDocs(
        query(collection(db, 'bookings'), where('workerId', '==', currentUser.uid))
      );
  
      if (!bookingQuerySnapshot.empty) {
        const bookingId = bookingQuerySnapshot.docs[0].id;
        const bookingRef = doc(db, 'bookings', bookingId);
  
        // Update the booking status to 'Accepted'
        await updateDoc(bookingRef, {
          status: 'Accepted',
        });
  
        if (ClientId) {
          // Query the clients collection to find the client with the matching ID
          const clientsCollection = collection(db, 'clients');
          const matchingClientsQuery = query(clientsCollection, where('id', '==', ClientId));
          const matchingClientsSnapshot = await getDocs(matchingClientsQuery);
  
          if (!matchingClientsSnapshot.empty) {
            // Increment the 'bookings' field in the first matching client's document
            const matchingClientDoc = matchingClientsSnapshot.docs[0];
            const currentBookings = matchingClientDoc.data().bookings || 0;
  
            await updateDoc(matchingClientDoc.ref, {
              bookings: currentBookings + 1,
            });
            console.log("client booking increased")
  
            // Decrement the 'bookings' field in the worker's document
            const workersCollection = collection(db, 'workers');
            const workerQuery = query(workersCollection, where('id', '==', currentUser.uid));
            const workerSnapshot = await getDocs(workerQuery);
  
            if (!workerSnapshot.empty) {
              const workerDoc = workerSnapshot.docs[0];
              const workerBookings = workerDoc.data().bookings || 0;
  
              await updateDoc(workerDoc.ref, {
                bookings: workerBookings - 1,
              });
              console.log("worker booking decreased")
  
              alert("Appointment Accepted, Client will get in contact. Thank you!");
              handleRefresh();
            } else {
              console.error('Worker not found with id:', currentUser.uid);
            }
          } else {
            console.error('Client not found with id:', clientID);
          }
        } else {
          console.error('Invalid clientID:', clientID);
        }
      } else {
        console.error('Booking not found for worker:', workerId);
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };
  
  

  const handleReject = async (workerId) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const db = getFirestore();
  
      // Query the bookings collection where the workerId matches the worker's email
      const bookingQuerySnapshot = await getDocs(
        query(collection(db, 'bookings'), where('workerId', '==', currentUser.uid))
      );
  
      if (!bookingQuerySnapshot.empty) {
        const bookingId = bookingQuerySnapshot.docs[0].id;
        const bookingRef = doc(db, 'bookings', bookingId);
  
        // Delete the booking document
        await deleteDoc(bookingRef);
  
         // Decrement the 'bookings' field in the worker's document
         const workersCollection = collection(db, 'workers');
         const workerQuery = query(workersCollection, where('id', '==', currentUser.uid));
         const workerSnapshot = await getDocs(workerQuery);

         if (!workerSnapshot.empty) {
           const workerDoc = workerSnapshot.docs[0];
           const workerBookings = workerDoc.data().bookings || 0;

           await updateDoc(workerDoc.ref, {
             bookings: workerBookings - 1,
           });
           console.log("worker booking decreased")
        alert("You declined to work");
        handleRefresh();
      } else {
        console.error('Booking not found for worker:', workerId);
      }
    }
    } catch (error) {
      console.error('Error marking as Rejected:', error);
    }
  };

  const renderBookings = bookings.filter((booking) => booking.status === "Pending");

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
    <TouchableOpacity onPress={toggleModal}>
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.clientsProfilemage }}
        style={styles.profileImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.clientName}</Text>
        <View style={styles.locCon}>
          <Entypo name="location-pin" size={24} color="black" style={styles.icon} />
          <Text style={styles.location}>{item.clientlocation}</Text>
        </View>
      </View>
      <View>
      <TouchableOpacity onPress={() => handleAccept(item.id)} style={styles.acceptButton}>
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReject(item.id)} style={styles.rejectButton}>
        <Text style={styles.rejectButtonText}>Reject</Text>
      </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
            <FontAwesome name="close" size={wp("6%")} color="#3abbd7" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            
          <Text style={styles.modalTitle}>Book Details</Text>
          
            <Text style={styles.modalText}> Wage: GH₵{item.UpdatedWage}</Text>
           
              <Text style={styles.modalText}> Payment Method: {item.PaymentMethod}</Text>
          </View>
        </View>
      </Modal>
    </View>
   
    </TouchableOpacity>
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
    flex:1,
    marginHorizontal: wp("2%"),
    height:wp("20%"),
   

  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp("1%"),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius:10,
    marginBottom:5
  },
  profileImage: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: 100,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: wp("4%"),
    fontWeight: 'bold',
    alignSelf:'center'
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
    fontSize: wp("4%"),
  },
  acceptButton: {
    fontWeight: 'bold',
    marginRight: wp("2%"),
    width: wp("20%"),
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#3abbd7',
    height: hp("4%"),
    justifyContent: 'center',
    marginBottom:5,
  },
  rejectButton: {
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: "#3abbd7",
    width: wp("20%"),
    borderRadius: 5,
    height: hp("4%"),
    justifyContent: 'center',
  },
  locCon: {
    flexDirection: 'row',
    marginHorizontal: wp("1%"),
    marginTop: hp("1%"),
    width: wp("40%"),
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "white",
    padding: wp("5%"),
    borderRadius: wp("2%"),
    width: wp("80%"),
  },
  modalTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    alignSelf:'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: wp("3%"),
    marginBottom: hp("2%"),
    borderRadius: wp("2%"),
  },
  modalText:{
    fontSize:16,
    marginBottom:10
  }
});

export default WorkerRequest;

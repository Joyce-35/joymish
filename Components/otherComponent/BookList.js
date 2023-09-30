import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BookList = () => {
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
        query(bookingsCollection, where("clientid", "==", currentUser.uid))
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
  const markCompleted = async (workerId) => {
    try {
      const db = getFirestore();
  
      // Query the bookings collection where the workerId matches the worker's email
      const bookingQuerySnapshot = await getDocs(
        query(collection(db, 'bookings'), where('workerId', '==', workerId))
      );
  
      if (!bookingQuerySnapshot.empty) {
        const bookingId = bookingQuerySnapshot.docs[0].id;
        const bookingRef = doc(db, 'bookings', bookingId);
  
        // Update the booking status to completed
        await updateDoc(bookingRef, {
          status: 'completed',
        });
  
        // Fetch all workers from the 'workers' collection
        const workersQuerySnapshot = await getDocs(collection(db, 'workers'));
        
        // Check if the workerId exists in the 'workers' collection
        const matchingWorker = workersQuerySnapshot.docs.find(
          (workerDoc) => workerDoc.data().id === workerId
        );
  
        if (matchingWorker) {
          const workerDocRef = doc(db, 'workers', matchingWorker.id);
  
          // Get the current value of NumberOfCompleted
          const currentNumberOfCompleted = matchingWorker.data().NumberOfCompleted || 0;
  
          // Increment the value and update the field
          await updateDoc(workerDocRef, {
            NumberOfCompleted: currentNumberOfCompleted + 1,
          });
  
          // After marking as completed, refresh the bookings list
          fetchBookings();
  
          // Show an alert to notify the user
          alert('Booking Completed', 'The booking has been marked as completed.');
        } else {
          console.error('Worker not found:', workerId);
        }
      } else {
        console.error('Booking not found for worker:', workerId);
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };
  
  
  
  
  
  

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
    setRefreshing(false);
  };
  const renderBookings = bookings.filter(
    (booking) => booking.status !== "completed"
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.workerProfileImage }}
        style={styles.profileImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.workerName}>{item.workerName}</Text>
        <TouchableOpacity
          style={styles.markCompletedButton}
          onPress={() => markCompleted(item.workerId)}
        >
          <Text style={styles.buttonText}>Mark Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={renderBookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  workerName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  markCompletedButton: {
    backgroundColor: "#3abbd7",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#3abbd7",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default BookList;

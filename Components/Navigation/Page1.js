import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';


import Browse from '../page2/Browse';
import HomePage from '../page2/Homepage';
import ProfileClient from '../page2/Profile_client';
import Request from '../page2/Request/Request';

const Tab = createBottomTabNavigator();

const StoreIcon = ({ navigation, reloadScreen }) => (
  <TouchableOpacity
    onPress={() => {
      reloadScreen(); // Call the reloadScreen function to trigger a reload
    }}
    style={{ paddingRight: 20 }}
  >
    <FontAwesome5 name="sync-alt" size={24} color="black" />
  </TouchableOpacity>
);

const Page1 = ({ navigation }) => {
  const [reloadKey, setReloadKey] = useState(0); // Create a state to control the reload
  const [bookings, setBookings] = useState(null); 
  
  const reloadScreen = () => {
    // Increment the reloadKey state variable to trigger a reload
    setReloadKey(reloadKey + 1);
  };
    // Function to fetch user data
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
  
        if (currentUser) {
          const db = getFirestore();
  
          const workersCollection = collection(db, 'workers');
          const workersQuery = query(workersCollection, where('id', '==', currentUser.uid));
          const workersSnapshot = await getDocs(workersQuery);
  
          if (!workersSnapshot.empty) {
            const workerDoc = workersSnapshot.docs[0];
            const workerData = workerDoc.data();
            const bookings = workerData.bookings;
            setBookings(bookings);
          } else {
            const clientsCollection = collection(db, 'clients');
            const clientsQuery = query(clientsCollection, where('id', '==', currentUser.uid));
            const clientsSnapshot = await getDocs(clientsQuery);
  
            if (!clientsSnapshot.empty) {
              const clientDoc = clientsSnapshot.docs[0];
              const clientData = clientDoc.data();
              const bookings = clientData.bookings;
              setBookings(bookings);
            } else {
              console.log('User data not found.');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    useEffect(() => {
      // Fetch data initially
      fetchData();
  
      // Set up an interval to fetch data every 5 seconds
      const intervalId = setInterval(fetchData, 5000);
  
      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
    
      // Function to update the rating based on NumberOfCompleted
      const updateRating = async (userId, numberOfCompleted) => {

        const db = getFirestore();
        const currentUser = getAuth().currentUser
        console.log("Checking Rating..............");
        
        try {
          let rating = '⭐⭐☆☆☆';
          if (numberOfCompleted >= 10 && numberOfCompleted <= 15) {
            rating = '⭐⭐⭐☆☆';
          } else if (numberOfCompleted >= 16 && numberOfCompleted <= 20) {
            rating = '⭐⭐⭐⭐☆';
          } else if (numberOfCompleted > 20) {
            rating = '⭐⭐⭐⭐⭐';
          }
        
          const workersCollection = collection(db, 'workers');
          
          // Query the workers collection for documents where "id" is equal to the current user's UID
          const querySnapshot = await getDocs(query(workersCollection, where('id', '==', currentUser.uid)));
          
          if (!querySnapshot.empty) {
            // Assuming there is only one matching document, update its rating
            const workerDoc = querySnapshot.docs[0].ref;
            await updateDoc(workerDoc, { rating: rating });
            console.log('Rating updated successfully.');
          } else {
            console.log('No matching document found.');
          }
        } catch (error) {
          console.error('Error updating rating:', error);
        }
      };
      
    
      // Function to fetch and update rating
      const fetchAndUpdateRating = async () => {
        try {
          const auth = getAuth();
          const currentUser = auth.currentUser;
      
          if (currentUser) {
            const db = getFirestore();
            const workersCollection = collection(db, 'workers');
            const querySnapshot = await getDocs(query(workersCollection, where('id', '==', currentUser.uid)));
      
            const workersData = querySnapshot.docs.map((doc) => {
              return { id: doc.id, ...doc.data() };
            });
      
            if (workersData.length > 0) {
              const numberOfCompleted = workersData[0].NumberOfCompleted;
      
              // Update rating based on NumberOfCompleted
              if (numberOfCompleted >= 10 && numberOfCompleted <= 20) {
                // Ensure the document exists before updating
                const workerDocRef = doc(db, 'workers', workersData[0].id);
                await updateRating(workerDocRef, numberOfCompleted);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching and updating rating:', error);
        }
      };
      
      
      
    
      // Call the fetchAndUpdateRating function
      console.log('checking completed')
      fetchAndUpdateRating();
    }, []);

  return (
    <Tab.Navigator
      key={reloadKey} // Change the key to force a reload when it changes
      screenOptions={{
        activeTintColor: 'blue',
        inactiveTintColor: 'gray',
        labelStyle: {
          textAlign: 'center',
        },
        headerRight: () => <StoreIcon navigation={navigation} reloadScreen={reloadScreen} />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Browse"
        component={Browse}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Booking"
        component={Request}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={size} color={color} />
          ),
          tabBarBadge: bookings !== null ? bookings : 0,// Set the badge value here (e.g., 5)
          tabBarBadgeStyle: { backgroundColor: 'red', color: 'white' }, // Customize badge style
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileClient}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Page1;

import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import { getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Review from "../otherComponent/Review";

const { width, height } = Dimensions.get("window");

const BrowseWorker = ({ route, navigation }) => {
  const { worker } = route.params;
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [location, setlocation] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [FullName, setFullName] = useState(null);
  const [ClientName, setClientName] = useState(null)
  const [updatedWage, setUpdatedWage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const sendCustomMessage = () => {
    const message = `Hello ${worker.fullName}, I saw your application on Joymish app. Kindly call me as soon as possible, I have a job for you.`;
    const phoneNumber = worker.phoneNumber;

    const encodedMessage = encodeURIComponent(message);
    const smsUrl = `sms:${phoneNumber}?body=${encodedMessage}`;

    Linking.openURL(smsUrl).catch((error) => {
      console.error("Error opening SMS app:", error);
    });
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore();
        const clientsCollection = collection(db, 'clients');

        const clientQuerySnapshot = await getDocs(
          query(clientsCollection, where('id', '==', user.uid))
        );

        if (!clientQuerySnapshot.empty) {
          const clientData = clientQuerySnapshot.docs[0].data();
          const fetchedProfilePictureUrl = clientData.profileImageUrl;
          const fetchedFullName = clientData.fullName;
          const fetchedLocation = clientData.location;
          const fetchClientName = clientData.fullName

          setProfilePictureUrl(fetchedProfilePictureUrl);
          setFullName(fetchedFullName);
          setlocation(fetchedLocation);
          setClientName(fetchClientName)
        }
      } else {
        console.error('User is not authenticated.');
      }
    };

    fetchProfilePicture();
  }, []);

  useEffect(() => {
    const storage = getStorage();
    const profileImageRef = ref(storage, worker.profileImageUrl);

    getDownloadURL(profileImageRef)
      .then((url) => {
        setProfileImageUrl(url);
      })
      .catch((error) => {
        console.error("Error fetching profile image:", error);
      });
  }, [worker.profileImageUrl]);

  const createBooking = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("User not authenticated.");
        return;
      }
  
      const db = getFirestore();
      const clientsCollection = collection(db, "clients");
  
      const clientQuerySnapshot = await getDocs(
        query(clientsCollection, where("id", "==", currentUser.uid))
      );
  
      if (clientQuerySnapshot.empty) {
        alert("Only authorized clients are allowed to book workers.");
        return;
      }
  
      const bookingsCollection = collection(db, "bookings");
  
      const existingBookingQuery = query(
        bookingsCollection,
        where("clientId", "==", currentUser.uid),
        where("workerId", "==", worker.id),
        where("status", "in", ["Pending", "Accepted"])
      );
  
      const existingBookingSnapshot = await getDocs(existingBookingQuery);
  
      if (!existingBookingSnapshot.empty) {
        alert("You already have a pending booking with this worker.");
        return;
      }
  
      // Query the "workers" collection for any worker whose 'id' matches worker.id
      const workersCollection = collection(db, "workers");
      const workersQuerySnapshot = await getDocs(
        query(workersCollection, where("id", "==", worker.id))
      );
  
      // Check if any worker with the specified ID exists
      if (workersQuerySnapshot.empty) {
        alert("Selected worker does not exist.");
        return;
      }
  
      // Since there's at least one worker with the specified ID, update bookings for all matching workers
      workersQuerySnapshot.forEach(async (doc) => {
        const workerDocRef = doc.ref;
        const currentBookings = doc.data().bookings || 0;
  
        // Update the worker's bookings field by incrementing
        await updateDoc(workerDocRef, {
          bookings: currentBookings + 1, // Increment the bookings field by 1
        });
      });
  
      const bookingData = {
        clientlocation: location,
        clientId: currentUser.uid,
        workerId: worker.id,
        workerName: worker.fullName,
        workerProfileImage: worker.profileImageUrl,
        clientsProfilemage: profilePictureUrl,
        workerlocation: worker.location,
        clientName: FullName,
        status: "Pending",
        UpdatedWage:updatedWage,
        PaymentMethod:paymentMethod,
        createdAt: new Date(),
      };
  
      await addDoc(bookingsCollection, bookingData);
  
      alert("Worker booked");
      console.log("Booking created successfully!");
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };
  
  
  
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => {
            navigation.navigate("Browse");
          }}
        >
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{worker.fullName}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.userInfo}>
            <View style={styles.imageContainer}>
              {profileImageUrl ? (
                <ImageBackground
                  source={{ uri: profileImageUrl }}
                  style={styles.image}
                />
              ) : (
                <Text>Loading...</Text>
              )}
            </View>

            <View style={styles.locationContainer}>
              <Entypo name="location-pin" size={24} style={styles.icon} />
              <Text style={styles.location}>{worker.location}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button1}
                onPress={sendCustomMessage}
              >
                <Text style={styles.button1Text}>Request a call back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button2}
                onPress={() => setShowContact(!showContact)}
              >
                <Text style={styles.button2Text}>
                  {showContact ? worker.phoneNumber : "Show Contact"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.details}>
              <View style={styles.detail1}>
                <Text style={styles.text}>Name</Text>
                <Text style={styles.text1}>{worker.fullName}</Text>
                <Text style={styles.text}>Email</Text>
                <Text style={styles.text1}>{worker.email}</Text>
                <Text style={styles.text}>Age</Text>
                <Text style={styles.text1}>{worker.age}</Text>
                <Text style={styles.text}>Wages (per hour)</Text>
                <Text style={styles.text1}>{worker.wage}</Text>
              </View>
              <View style={styles.detail2}>
                <Text style={styles.text}>Rating</Text>
                <Text style={styles.text1}>{worker.rating}</Text>
                <Text style={styles.text}>Number of work completed</Text>
                <Text style={styles.text1}>{worker.NumberOfCompleted}</Text>
                <TouchableOpacity
                  style={styles.button3}
                  onPress={toggleModal}
                >
                  <Text style={styles.button3Text}>Book</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.leave}>Leave a review</Text>
            <Review ClientFullName={ClientName} WorkerId={worker.id} ClientPicture={profilePictureUrl} />
          </View>
        </View>
      </ScrollView>
      <View>
        <Review />
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
            <Text style={styles.modalTitle}>Book Worker</Text>


            <Text style={styles.label}>Select Payment Method:</Text>
            <Picker
        selectedValue={paymentMethod}
        style={styles.paymentMethodPicker}
        onValueChange={(itemValue, itemIndex) =>
          setPaymentMethod(itemValue)
        }>
      
        <Picker.Item label="Mobile Money" value="Mobile Money" />
        <Picker.Item label="Cash" value="Cash" />
      </Picker>
            <TextInput
              style={styles.modalInput}
              value={updatedWage}
              onChangeText={(text) => setUpdatedWage(text)}
              keyboardType="numeric"
              placeholder="Enter Proposed Wage"
            />
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={createBooking} // Call the updateWage function
            >
              <Text style={styles.modalButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#3abbd7",
    height: hp("6%"),
    alignItems: "center",
    marginTop: hp("2%"),
    paddingHorizontal: wp("2%"),
  },
  headerText: {
    color: "#ffffff",
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginLeft: wp("27%"),
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    paddingHorizontal: wp("5%"),
    paddingTop: hp("2%"),
    paddingBottom: hp("10%"), 
  },
  image: {
    height: hp("30%"),
    width: wp("70%"),
    alignSelf: "center",
  },
  back: {
    marginLeft: wp("2%"),
  },
  imageContainer: {
    height: hp("40%"),
    width: wp("85%"),
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "#3abbd7",
    alignItems: "center",
    borderRadius: wp("10%"),
  },
  locationContainer: {
    flexDirection: "row",
    marginTop: hp("1%"),
  },
  icon: {
    color: "#4f3d3d",
  },
  location: {
    color: "#4f3d3d",
    marginLeft: wp("2%"),
  },
  buttonContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: hp("2%"),
  },
  button1: {
    height: hp("6%"),
    width: wp("40%"),
    borderWidth: 1,
    borderColor: "#3abbd7",
    borderRadius: wp("10%"),
    marginRight: wp("2%"),
    justifyContent: "center",
  },
  button2: {
    height: hp("6%"),
    width: wp("40%"),
    backgroundColor: "#3abbd7",
    borderRadius: wp("10%"),
    justifyContent: "center",
  },
  button3: {
    marginTop: hp("3%"),
    height: hp("5%"),
    width: wp("30%"),
    backgroundColor: "#3abbd7",
    borderRadius: wp("10%"),
    justifyContent: "center",
  },
  button1Text: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    alignSelf: "center",
  },
  button2Text: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    alignSelf: "center",
    color: "white",
  },
  button3Text: {
    fontSize: wp("3%"),
    fontWeight: "bold",
    alignSelf: "center",
    color: "white",
  },
  details: {
    flexDirection: "row",
    marginTop: hp("2%"),
    alignSelf: "center",
  },
  detail1: {
    borderWidth: 1,
    borderColor: "#3abbd7",
    borderRadius: wp("10%"),
    width: "50%",
    height: hp("30%"),
    marginRight: wp("2.5%"),
    alignItems: "center",
  },
  detail2: {
    borderWidth: 1,
    borderColor: "#3abbd7",
    borderRadius: wp("10%"),
    width: "40%",
    height: hp("30%"),
    alignItems: "center",
  },
  text: {
    color: "#4f3d3d",
    textAlign: "center",
  },
  text1: {
    textAlign: "center",
    marginVertical: hp("1%"),
    fontWeight: "bold",
  },
  leave: {
    fontSize: wp("5%"),
    textAlign: "center",
    marginBottom: hp("2%"),
    fontWeight: "bold",
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
  modalButton: {
    backgroundColor: "#3abbd7",
    borderRadius: wp("2%"),
    paddingVertical: hp("1%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  modalButtonText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "white",
  },
  closeIcon: {
    position: "absolute",
    top: hp("2%"),
    right: wp("2%"),
  },
  label: {
    fontSize: 12,
   
  },
});

export default BrowseWorker;

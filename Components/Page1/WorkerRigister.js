import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export const WorkerRegister = ({ route, navigation }) => {
  const handleBackButton = () => {
    return true; // Prevent navigation
  };

  useEffect(() => {
    // Attach the event listener for the back button
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);

    return () => {
      // Remove the event listener when the component is unmounted
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButton
      );
    };
  }, []);

  const email = route.params.email;
  const id = route.params.id
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [wage, setWage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);


  const handleImageUpload = async () => {
    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleConfirm = async () => {
    try {
      
      
      if (!profileImage) {
        console.error("Please upload a profile image.");
        return;
      }
      setIsRegistering(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.error("Location permission not granted.");
        return;
      }

      const userLocation = await getLocation();
      console.log("Location fetched:", userLocation);
          // Check if a worker with the same email already exists
    const workerExists = await checkWorkerExists(email);

    if (workerExists) {
      Alert("A worker with this email already exists.");
      return;
    }

      // ... (Rest of the handleConfirm function)
      const blobImage = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", profileImage, true);
        xhr.send(null);
      });

      const metadata = {
        contentType: "image/jpeg",
      };
      const storage = getStorage();
      const storageRef = ref(storage, "images/worker" + Date.now());
      const uploadTask = uploadBytesResumable(storageRef, blobImage, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle upload progress here if needed
        },
        (error) => {
          console.error("Error uploading image:", error);
        },
        async () => {
          // Image upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("image uploaded")

          const db = getFirestore();
          const workersCollection = collection(db, "workers");

          const newWorkerRef = await addDoc(workersCollection, {
            fullName,
            phoneNumber,
            age,
            location: userLocation,
            wage,
            email,
            id,
            NumberOfCompleted:0,
            bookings:0,
            profileImageUrl: downloadURL,
            rating: "⭐⭐☆☆☆"
          });
          console.log("Data added to Firestore.");
          navigation.navigate("Main");
          setIsRegistering(false);

          console.log("Worker registered successfully:", newWorkerRef.id);
          setFullName('');
          setProfileImage(''),
          setPhoneNumber('');
          setAge('');
          setWage('');
          
         
        }
      );
    } catch (error) {
      console.error("Error registering worker:", error);
    }
  };

  const getLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocoding to get the town or city name
    const reverseGeocode = async () => {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        return `${result[0].city}, ${result[0].region}`;
      }
      return "Unknown Location";
    };

    return reverseGeocode();
  };
  const checkWorkerExists = async (workerEmail) => {
    const db = getFirestore();
    const workersCollection = collection(db, "workers");
  
    const querySnapshot = await getDocs(
      query(workersCollection, where("email", "==", workerEmail))
    );
  
    return !querySnapshot.empty;
  };
  

  return (
    <View style={styles.container}>
    <Text style={styles.textWrapper}>Register Worker</Text>
      <View style={styles.formContainer}>
      <View style={styles.uploadContainer}>
      <TouchableOpacity onPress={handleImageUpload} style={styles.imageUpload}>
    {profileImage ? (
      <Image source={{ uri: profileImage }} style={styles.uploadedImage} />
    ) : (
      <Text style={styles.uploadText}>Upload Image</Text>
    )}
  </TouchableOpacity>
       
      </View>
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="numeric"
            />
          </View>

          {/* Age */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>AGE</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          {/* Wages Per Hour */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>WAGES PER HOUR</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your wage"
              value={wage}
              onChangeText={setWage}
              keyboardType="numeric"
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
  onPress={handleConfirm}
  style={[styles.button, isRegistering && styles.disabledButton]}
  disabled={isRegistering}
>
  {isRegistering ? (
    <ActivityIndicator color="#ffffff" size="small" />
  ) : (
    <Text style={styles.buttonText}>Confirm</Text>
  )}
</TouchableOpacity>

        </View>
      </View>
  
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
    alignItems: "center",
  },
  textWrapper: {
    color: "#29899e",
    fontSize: hp("2.5%"),
    fontWeight: "700",
    marginTop: hp("5%"),
  },
  uploadContainer: {
    marginTop: hp("2%"),
    alignItems: "center",
  },
  imageUpload: {
    alignItems: "center",
    backgroundColor: "#3abbd7",
    borderRadius: 100,
    height: wp("25%"),
    justifyContent: "center",
    width: wp("25%"),
  },
  uploadText: {
    color: "#ffffff",
    fontSize: hp("1.5%"),
    fontWeight: "700",
    marginTop: hp("1%"),
  },
  formContainer: {
    width: wp("80%"),
  },
  inputWrapper: {
    marginBottom: hp("1.5%"),
  },
  inputLabel: {
    color: "#565353",
    fontSize: hp("1.5%"),
    fontWeight: "700",
    marginBottom: hp("0.3%"),
  },
  input: {
    borderColor: "#3abbd7",
    borderRadius: 10,
    borderWidth: 1,
    height: hp("5%"),
    paddingLeft: wp("3%"),
    paddingRight: wp("6%"),
  },
  button: {
    backgroundColor: "rgb(85.65, 224.52, 255)",
    borderRadius: 15,
    height: hp("6%"),
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp("2%"),
  },
  buttonText: {
    color: "#ffffff",
    fontSize: hp("2%"),
    fontWeight: "700",
  },
});

export default WorkerRegister;
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const ClientRegister = ({route, navigation }) => {
  const handleBackButton = () => {
    return true; // Prevent navigation
  };

  useEffect(() => {
    // Attach the event listener for the back button
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      // Remove the event listener when the component is unmounted
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
  const email = route.params.email;
  const id = route.params.id
  const [fullName, setFullName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };



  const handleConfirm = async () => {
    try {
      console.log("registering a client")
      if (!profileImage) {
        console.error("Please upload a profile image.");
        return;
      }
     
      const { status } = await Location.requestForegroundPermissionsAsync();
      setIsRegistering(true);

      if (status !== "granted") {
        console.error("Location permission not granted.");
        return;
      }

      const userLocation = await getLocation();

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
      const storageRef = ref(storage, "images/clients" + Date.now());
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
          const db = getFirestore();
          const clientsCollection = collection(db, 'clients');
          const newClientRef = await addDoc(clientsCollection, {
            fullName,
            email,
            id,
            location: userLocation,
            profileImageUrl: downloadURL,
            bookings:0,
          });
          setIsRegistering(false);
          

          console.log('Client registered successfully:', newClientRef.id);
          setFullName('');
          setProfileImage(''),
          navigation.navigate("Main");
         
         
        }
        
      );
    } catch (error) {
      console.error('Error registering client:', error);
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


  return (
    <View style={styles.forgotPwdScreen}>
      <Text style={styles.textWrapper}>Client Register</Text>
      <View style={styles.uploadContainer}>
      <TouchableOpacity onPress={handleImageUpload} style={styles.imageUpload}>
    {profileImage ? (
      <Image source={{ uri: profileImage }} style={styles.uploadedImage} />
    ) : (
      <Text style={styles.uploadText}>Upload Image</Text>
    )}
  </TouchableOpacity>
       
      </View>
      <View style={styles.container}>
        <View style={styles.overlap}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
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

// Rest of the styles remain unchanged


const styles = StyleSheet.create({
  forgotPwdScreen: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginTop:70,
  },

  uploadContainer: {
    marginTop: hp('2%'),
    alignItems: 'center',
  },
  imageUpload: {
    alignItems: 'center',
    backgroundColor: '#3abbd7',
    borderRadius: 100,
    height: wp('25%'),
    justifyContent: 'center',
    width: wp('25%'),
  },
  uploadedImage: {
    borderRadius: 100,
    height: wp('25%'),
    width: wp('25%'),
  },
  uploadText: {
    color: '#ffffff',
    fontSize: hp('1.5%'),
    fontWeight: '700',
    marginTop: hp('1%'),
  },
  textWrapper: {
    color: '#29899e',
    fontSize: hp('2.5%'),
    fontWeight: '700',
    marginTop: hp('5%'),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:90,
    marginTop:50,
  },
  overlap: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    paddingHorizontal: wp('4%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  inputWrapper: {
    marginBottom: hp('1.5%'),
    width: '100%',
  },
  inputLabel: {
    color: '#565353',
    fontSize: hp('1.5%'),
    fontWeight: '700',
    marginBottom: hp('0.3%'),
  },
  input: {
    borderColor: '#3abbd7',
    borderRadius: 10,
    borderWidth: 1,
    height: hp('5%'),
    paddingLeft: wp('3%'),
    paddingRight: wp('6%'),
  },
  button: {
    backgroundColor: 'rgb(85.65, 224.52, 255)',
    borderRadius: 15,
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: hp('2%'),
    fontWeight: '700',
  },
  span: {
    color: '#565353',
  },
  textWrapper5: {
    color: '#3abbd7',
  },
});

export default ClientRegister;

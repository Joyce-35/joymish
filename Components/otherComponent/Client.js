import { AntDesign, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


const Client = ({ navigation, refreshing }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [userlocation, setUserlocation] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          setIsAuthenticated(true);

          // Fetch user data from Firebase
          const db = getFirestore();
          const clientsCollection = collection(db, 'clients');
          const userQuerySnapshot = await getDocs(query(clientsCollection, where('id', '==', currentUser.uid)));

          if (!userQuerySnapshot.empty) {
            const userData = userQuerySnapshot.docs[0].data();
            setUserName(userData.fullName);
            setUserEmail(userData.email);
            setProfileImage(userData.profileImageUrl);
            setUserlocation(userData.location);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigation.navigate('LoginScreen'); // Navigate to the login screen after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Function to handle image upload
  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }

      const blobImage = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", result.assets[0].uri, true);
        xhr.send(null);
      });

      const metadata = {
        contentType: "image/jpeg",
      };

      const storage = getStorage();
      const storageRef = ref(storage, "images/" + Date.now());
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
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const db = getFirestore();
          const currentUser = getAuth().currentUser;
          const userEmail = currentUser.email;
          console.log("Current User Email:", userEmail);
          console.log("Download URL:", downloadURL);

          // Check if the email in the 'clients' collection matches the current user's email
          const querySnapshot = await getDocs(query(collection(db, "clients"), where("email", "==", userEmail)));

          if (!querySnapshot.empty) {
            const clientDoc = querySnapshot.docs[0];
            console.log("Client Document ID:", clientDoc.id);

            // Reference the specific document using doc
            const docRef = doc(db, "clients", clientDoc.id);

            // Update the document using docRef.update
            await updateDoc(docRef, {
              profileImageUrl: downloadURL,
            });

            console.log("Profile picture uploaded and updated successfully.");
          } else {
            console.log("No matching client document found.");
          }
        }
      );
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  if (refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3abbd7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image
          source={profileImage ? { uri: profileImage } : require("../../assets/images/washing.png")}
          style={styles.profileImage}
        />
        <TouchableOpacity onPress={handleImageUpload} style={styles.uploadIcon}>
          <AntDesign name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Entypo name="location-pin" size={24} style={styles.icon} />
          <Text style={styles.infoText}>Location: {userlocation}</Text>
        </View>

        <View style={styles.infoItem}>
          <AntDesign name="user" size={24} style={styles.icon} />
          <Text style={styles.infoText}>Name: {userName}</Text>
        </View>

        <View style={styles.infoItem}>
          <AntDesign name="mail" size={24} style={styles.icon} />
          <Text style={styles.infoText}>Email: {userEmail}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPwdScreen')} style={styles.button}>
          <AntDesign name="key" size={24} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <AntDesign name="logout" size={24} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('10%'), // Adjust the spacing between sections
  },
  profileImage: {
    width: wp('30%'), // Adjust the image size as needed
    height: wp('30%'), // Adjust the image size as needed
    borderRadius: wp('15%'), // Make it a circle
  },
  uploadIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3abbd7',
    borderRadius: wp('7%'), // Make it a circle
    padding: wp('2%'),
  },
  infoContainer: {
    width: '100%',
    marginBottom: wp('10%'),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('2%'), // Adjust the spacing between items
  },
  icon: {
    color: '#3abbd7',
    marginRight: wp('2%'), // Adjust the spacing between icon and text
  },
  infoText: {
    fontSize: wp('4.5%'), // Adjust the font size as needed
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3abbd7',
    padding: wp('3%'), // Adjust the button padding as needed
    borderRadius: wp('5%'), // Make it rounded
    marginVertical: hp('3%'), // Adjust the spacing between buttons
  },
  buttonIcon: {
    color: 'white',
    marginRight: wp('2%'), // Adjust the spacing between icon and text
  },
  buttonText: {
    color: 'white',
    fontSize: wp('4%'), // Adjust the font size as needed
  },
});

export default Client;

import {
  AntDesign,
  Entypo,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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

const Worker = ({ navigation, refreshing }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updatedWage, setUpdatedWage] = useState("");
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  //reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const db = getFirestore();
          const reviewsCollection = collection(db, "reviews");
          const querySnapshot = await getDocs(
            query(reviewsCollection, where("WorkerId", "==", currentUser.uid))
          );

          const reviewsData = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });

          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  //end of review

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigation.navigate("LoginScreen"); // Navigate to the login screen after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [workers, setWorkers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          setIsAuthenticated(true);

          const db = getFirestore();
          const workersCollection = collection(db, "workers");
          const querySnapshot = await getDocs(
            query(workersCollection, where("id", "==", currentUser.uid))
          );

          const workersData = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          });
          console.log(workersData);
          setWorkers(workersData);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching worker data:", error);
      }
    };

    fetchWorkerData();
  }, []);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please log in to view worker data.</Text>
      </View>
    );
  }

  const updateWage = async () => {
    try {
      const db = getFirestore();
      const currentUser = getAuth().currentUser;
      const userId = currentUser.uid;

      const querySnapshot = await getDocs(
        query(collection(db, "workers"), where("id", "==", userId))
      );

      if (!querySnapshot.empty) {
        const clientDoc = querySnapshot.docs[0];
        console.log("Client Document ID:", clientDoc.id);

        // Reference the specific document using doc
        const docRef = doc(db, "workers", clientDoc.id);

        // Update the document using docRef.update
        await updateDoc(docRef, {
          wage: updatedWage, // Use the updatedWage state
        });

        console.log("Wage updated successfully.");

        // Close the modal
        toggleModal();
      }
    } catch (error) {
      console.error("Error updating wage:", error);
    }
  };

  // uplaod profile
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
          const userId = currentUser.uid;

          // Check if the email in the 'workers' collection matches the current user's email
          const querySnapshot = await getDocs(
            query(collection(db, "workers"), where("id", "==", userId))
          );

          if (!querySnapshot.empty) {
            const clientDoc = querySnapshot.docs[0];
            console.log("Client Document ID:", clientDoc.id);

            // Reference the specific document using doc
            const docRef = doc(db, "workers", clientDoc.id);

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

  //end of profile update
  //reviews

  if (refreshing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#3abbd7" />
      </View>
    );
  }
  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      {item.ClientPicture && (
        <Image source={{ uri: item.ClientPicture }} style={styles.avatar} />
      )}
      <View style={styles.reviewContent}>
        <Text style={styles.name}>{item.ClientFullName}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Image
                style={styles.profileImage}
                source={{ uri: item.profileImageUrl }}
              />
              <TouchableOpacity
                onPress={handleImageUpload}
                style={styles.uploadButton}
              >
                <AntDesign
                  name="camera"
                  size={wp("8%")}
                  color="#3abbd7"
                  style={styles.uploadIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.infoContainer}>
              <View style={{ flexDirection: "row" }}>
                <Entypo name="location" size={wp("6%")} color="#3abbd7" />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <Text style={styles.clientName}>{item.fullName}</Text>
              <Text style={styles.clientName}> Rating: {item.rating}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <AntDesign
                  name="mail"
                  size={wp("6%")}
                  color="#3abbd7"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{item.email}</Text>
              </View>
              <View style={styles.detailItem}>
                <AntDesign
                  name="user"
                  size={wp("6%")}
                  color="#3abbd7"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Age: {item.age}</Text>
              </View>
              <View style={styles.detailItem1}>
                <MaterialIcons
                  name="payment"
                  size={wp("6%")}
                  color="#3abbd7"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>Wages: GH₵ {item.wage}</Text>
                <TouchableOpacity onPress={toggleModal}>
                  <FontAwesome
                    name="edit"
                    size={wp("6%")}
                    color="#3abbd7"
                    style={styles.detailIcon1}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.detailItem}>
                <Entypo
                  name="old-phone"
                  size={wp("6%")}
                  color="#3abbd7"
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{item.phoneNumber}</Text>
              </View>
            </View>
            <View style={styles.reviewsContainer}>
              <TouchableOpacity
                onPress={() => setShowReviews(!showReviews)} // Toggle reviews visibility
                style={styles.reviewButton}
              >
                <Text style={styles.reviewsTitle}>
                  {showReviews ? "Hide Reviews" : "View Reviews"}
                </Text>
              </TouchableOpacity>
              {showReviews && ( // Render reviews only if showReviews is true
                <FlatList
                  data={reviews}
                  renderItem={renderReview}
                  keyExtractor={(item) => item.id}
                />
              )}
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
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
            <Text style={styles.modalTitle}>Edit Wage</Text>
            <TextInput
              style={styles.modalInput}
              value={updatedWage}
              onChangeText={(text) => setUpdatedWage(text)}
              keyboardType="numeric"
              placeholder="Enter new wage"
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={updateWage} // Call the updateWage function
            >
              <Text style={styles.modalButtonText}>Update</Text>
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
    backgroundColor: "#f0f0f0",
    padding: wp("5%"),
  },
  profileContainer: {
    backgroundColor: "#f0f0f0",
    padding: wp("4%"),
    marginBottom: hp("2%"),
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: hp("2%"),
  },
  profileImage: {
    width: wp("40%"),
    height: wp("40%"),
    borderRadius: wp("20%"),
  },
  uploadButton: {
    position: "absolute",
    top: hp("18%"),
    right: wp("31%"),
  },
  uploadIcon: {
    color: "#3abbd7",
    fontSize: wp("8%"),
  },
  infoContainer: {
    alignItems: "center",
    marginTop: hp("5%"),
  },
  clientName: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("1%"),
  },
  location: {
    color: "#4f3d3d",
    fontSize: wp("4%"),
    marginLeft: wp("3%"),
  },
  detailsContainer: {
    justifyContent: "space-between",
    marginTop: hp("2%"),
  },
  details: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: wp("3.5%"),
    color: "#4f3d3d",
  },
  detailText: {
    fontSize: wp("3.5%"),
    fontWeight: "bold",
    marginLeft: wp("3.5%"),
  },
  reviewsContainer: {
    marginTop: hp("2%"),
  },
  reviewsTitle: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "white",
  },
  reviewItem: {
    flexDirection: "row",
    marginTop: hp("1%"),
  },
  bullet: {
    fontSize: wp("4%"),
    color: "#3abbd7",
    marginRight: wp("2%"),
  },
  reviewText: {
    fontSize: wp("3.5%"),
  },
  logoutButton: {
    backgroundColor: "#3abbd7",
    borderRadius: wp("5%"),
    alignSelf: "center",
    marginTop: hp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("5%"),
  },
  logoutButtonText: {
    fontSize: wp("4%"),
    fontWeight: "bold",
    color: "white",
  },
  detailItem: {
    flexDirection: "row",
    marginVertical: hp("1.5%"),
  },
  detailItem1: {
    flexDirection: "row",
    marginVertical: hp("1.5%"),
  },
  detailIcon1: {
    paddingLeft: wp("40%"),
  },
  reviewItem: {
    marginTop: hp("2%"),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("2%"),
    width: wp("80%"),
    backgroundColor: "#cdd1ce",
    borderRadius: wp("4%"),
  },
  avatar: {
    width: wp("15%"),
    height: wp("15%"),
    borderRadius: wp("15%") / 2,
    marginRight: wp("3%"),
  },
  reviewContent: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
  },
  message: {
    fontSize: wp("4%"),
  },
  time: {
    fontSize: wp("3.5%"),
    color: "#888",
  },
  reviewButton: {
    backgroundColor: "#3abbd7",
    borderRadius: wp("2%"),
    alignSelf: "center",
    marginTop: hp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("5%"),
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
});

export default Worker;

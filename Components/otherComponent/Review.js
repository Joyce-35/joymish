import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Review = ({ ClientFullName, WorkerId , ClientPicture}) => {
  const [newReview, setNewReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsCollection = collection(db, 'reviews');
        const q = query(reviewsCollection, where('WorkerId', '==', WorkerId));
        const reviewsSnapshot = await getDocs(q);
        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
      } catch (error) {}
    };

    fetchReviews();
  }, [WorkerId]);

  const handleSubmitReview = async () => {
    if (newReview.trim() !== '') {
      const reviewsCollection = collection(db, 'reviews');
      const reviewData = {
        ClientFullName: ClientFullName,
        message: newReview,
        WorkerId: WorkerId,
        ClientPicture:ClientPicture,
        time: new Date().toLocaleString(),
        // Add the 'time' property with the current timestamp
      };

      try {
        await addDoc(reviewsCollection, reviewData);
        console.log('Review added successfully');
        setNewReview('');
      } catch (error) {
        console.error('Error adding review: ', error);
      }
    }
  };

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
      <TextInput
        style={styles.input}
        placeholder="Write a review..."
        value={newReview}
        onChangeText={setNewReview}
        multiline
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
        <Text style={styles.buttonText}>Submit Review</Text>
      </TouchableOpacity>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: hp('2%'),
  },
  input: {
    width: wp('80%'),
    height: hp('10%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2%'),
    padding: wp('2%'),
    marginBottom: hp('2%'),
  },
  submitButton: {
    backgroundColor: '#3abbd7',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('2%'),
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewItem: {
    marginTop: hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('2%'),
    width: wp('90%'),
    backgroundColor: '#cdd1ce',
    borderRadius: wp('4%'),
  },
  avatar: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('15%') / 2,
    marginRight: wp('3%'),
  },
  reviewContent: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
  },
  message: {
    fontSize: wp('4%'),
  },
  time: {
    fontSize: wp('3.5%'),
    color: '#888',
  },
});

export default Review;

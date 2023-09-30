import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import call from 'react-native-phone-call';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const WorkerList = ({ navigation }) => {
  const [workers, setWorkers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      const db = getFirestore();
      const workersCollection = collection(db, 'workers');
      const auth = getAuth();
      const currentUserId = auth.currentUser.uid;
      let queryRef = query(workersCollection, where('id', '!=', currentUserId));
  
      // Updated sorting logic for "Name" in ascending order
      if (sortBy === 'location') {
        queryRef = orderBy(queryRef, 'location');
      } else if (sortBy === 'name') {
        queryRef = orderBy(queryRef, 'fullName', 'asc'); // Sort by 'fullName' field in ascending order
      }
  
      const querySnapshot = await getDocs(queryRef);
      const workerData = querySnapshot.docs.map((doc) => doc.data());
      setWorkers(workerData);
    };
  
    fetchWorkers();
  }, [sortBy]);
  

  const handleImagePress = (worker) => {
    navigation.navigate('BrowseWorker', { worker });
  };

  const handleCallPress = (phoneNumber) => {
    const args = {
      number: phoneNumber,
      prompt: true,
    };

    call(args).catch(console.error);
  };

  const filteredWorkers = workers.filter((worker) =>
    worker.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.profileImageUrl }} alt="Profile" style={styles.image} />
        </View>

        <View style={styles.workerInfo}>
          <Text style={styles.name}>Name: {item.fullName}</Text>
          <Text style={styles.email}>Wages: {item.wage}</Text>
          <Text style={styles.review}>Rating: {item.rating}</Text>
          <Text style={styles.textWrapper}>Location: {item.location}</Text>
        </View>

        <MaterialIcons
          name="call"
          size={24}
          color="black"
          style={styles.call}
          onPress={() => handleCallPress(item.phoneNumber)}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sortingContainer}>
        <Text style={styles.sortLabel}>Sort By:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === null && styles.activeSortButton]}
          onPress={() => setSortBy(null)}
        >
          <Text style={[styles.sortButtonText, sortBy === null && styles.activeSortButtonText]}>
            Default
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'location' && styles.activeSortButton]}
          onPress={() => setSortBy('location')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'location' && styles.activeSortButtonText]}>
            Location
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
          onPress={() => setSortBy('name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
            Name
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchInputWrapper}>
        <AntDesign name="search1" size={wp('6%')} color="black" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>
      <FlatList
        style={styles.list}
        data={filteredWorkers}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: hp('1%'),
    paddingHorizontal: wp('3%'),
  },
  list: {
    flex: 1,
    marginTop: hp('2%'),
  },
  itemContainer: {
    backgroundColor: '#e6e8eb',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
  },
  imageContainer: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: wp('11%'),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: wp('10%'),
  },
  workerInfo: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  name: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
  },
  email: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
  },
  review: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
  },
  textWrapper: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  call: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('3%'),
  },
  sortingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  sortLabel: {
    fontSize: wp('4%'),
    marginRight: wp('2%'),
  },
  sortButton: {
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    borderWidth: wp('0.2%'),
    borderColor: '#3abbd7',
    borderRadius: wp('2%'),
    marginRight: wp('2%'),
  },
  activeSortButton: {
    backgroundColor: '#3abbd7',
  },
  sortButtonText: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
  },
  activeSortButtonText: {
    color: 'white',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: wp('0.2%'),
    borderColor: '#181c2e',
    borderRadius: wp('5%'),
    height: hp('6%'),
    paddingLeft: wp('3%'),
    marginBottom: hp('1%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
    color: '#181c2e',
  },
  searchInput: {
    flex: 1,
    fontSize: wp('4%'),
  },
});

export default WorkerList;

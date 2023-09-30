import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import WorkerList from './WorkerList';

const { width } = Dimensions.get('window');


const Browse = ({navigation}) => {

  return (
    <View style={styles.container}>
        <View style={styles.contentWrapper1}>
         <WorkerList navigation={navigation} />
        </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: width, // Occupy full width of the screen
  },

  contentWrapper1: {
    width:'98%',
    height:'100%',
    alignSelf:'center'
  },
  overlap: {
    backgroundColor: '#3abbd7',
    height: 47,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:20,
  },
  textWrapper: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  navBar: {
    backgroundColor: "#fff",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingHorizontal: 20,
    paddingBottom: 5,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navIconContainer: {
    alignItems: "center",
  },
  navIconLabel: {
    fontSize: 12,
    color: "#3abbd7",
    marginTop: 4,
  },
});

export default Browse;

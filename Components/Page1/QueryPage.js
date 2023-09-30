import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export const Query = ({route,navigation}) => {
  const{email, id} = route.params
  return (
    <View style={styles.Query}>
      <Image source={require('../../assets/images/top1.png')} style={styles.group} />
      <Image source={require('../../assets/images/top2.png')} style={styles.img} />
      <View style={styles.container}>
          <TouchableOpacity
          onPress={()=>{
            navigation.navigate("ClientRegister", { email:email, id:id})
          }}
           style={styles.button}>
            <Text style={styles.buttonText}>Client!</Text>
          </TouchableOpacity>
     
      <Text>OR</Text>
     
          <TouchableOpacity
          onPress={()=>{
            navigation.navigate('WorkerRegister', { email:email, id:id});

          }}
           style={styles.button}>
            <Text style={styles.buttonText}>Worker!</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Query: {
    backgroundColor: '#ffffff',
    flex: 1,
    alignItems: 'center',
  },
  group: {
    height: hp('30%'),
    width: wp('100%'),
  },
  img: {
    height: hp('10%'),
    position: 'absolute',
    bottom: 0,
    width: wp('100%'),
  },
  textWrapper: {
    color: '#29899e',
    fontSize: hp('2.5%'),
    fontWeight: '700',
    marginTop: hp('5%'),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:90,
    width: wp('80%'),
  },
  overlap: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgb(85.65, 224.52, 255)',
    borderRadius: 15,
    height: hp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp('2%'),
    width: '100%',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: hp('2%'),
    fontWeight: '700',
  },

});

export default Query;

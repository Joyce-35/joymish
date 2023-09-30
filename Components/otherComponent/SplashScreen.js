import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const SplashPage = ( {navigation}) => {

  // Navigate to the login screen after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('LoginScreen');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigation]);
  return (
    <View style={styles.splashPage}>
        <Image source={require('../../assets/images/top1.png')} style={styles.group} />
        <Image source={require('../../assets/images/top2.png')} style={styles.img} />
        <Image source={require('../../assets/icon.jpg')} style={styles.rectangle} />
        <Text style={styles.title}>JoyMish</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  splashPage: {
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  group: {
    height: hp('30%'),
    position: 'absolute',
    top: 0,
    width: wp('100%'),
  },
  img: {
    height: hp('10%'),
    position: 'absolute',
    bottom: 0,
    width: wp('100%'),
  },
  rectangle: {
    height: 150,
    position: 'absolute',
    top: 400,
    width: 150,
    borderRadius:50,
    alignSelf:'center',
  },
  title:{
    fontSize:25,
    fontWeight:'bold',
    marginBottom:250,
    color: "#3abbd7",

  }
});

export default SplashPage;

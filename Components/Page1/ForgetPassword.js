import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { React, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export const ForgotPwdScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const handleResetPassword = async () => {
    auth = getAuth()
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent successfully. Please check your email.');
    } catch (error) {
      alert('Error sending password reset email: ' + error.message);
      console.log('Error sending password reset email: ' + error.message);
    }
  };
  
  
  return (
    <View style={styles.forgotPwdScreen}>
      <Image source={require('../../assets/images/top1.png')} style={styles.group} />
      <Image source={require('../../assets/images/top2.png')} style={styles.img} />
      <Text style={styles.textWrapper}>Forgot Password</Text>
      <View style={styles.container}>
      <View style={styles.overlap}>
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
    <TextInput
      style={styles.input}
      placeholder="example@hotmail.com"
      value={email}
      onChangeText={setEmail}
    />
  </View>
  <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
    <Text style={styles.buttonText}>Reset Password</Text>
  </TouchableOpacity>
</View>
        <Text style={styles.alreadyHaveAccount}>
          <Text style={styles.span}>Already have an account? </Text>
          <TouchableOpacity onPress={()=>{
            navigation.navigate("LoginScreen")
          }}><Text style={styles.textWrapper5}>Login</Text></TouchableOpacity>
          
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  forgotPwdScreen: {
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
  alreadyHaveAccount: {
    color: '#565353',
    fontSize: hp('1.5%'),
    fontWeight: '700',
    marginTop: hp('2%'),
  },
  span: {
    color: '#565353',
  },
  textWrapper5: {
    color: '#3abbd7',
  },
});

export default ForgotPwdScreen;

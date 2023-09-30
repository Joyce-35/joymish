import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { React, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  const handleLogin = async () => {
    setIsRegistering(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in successfully:', user.uid);
      setEmail('');
      setPassword('');
      setIsRegistering(false);
      navigation.navigate("Main");
     
    } catch (error) {
      
      let errorMessage = "An error occurred while logging in. Please try again.";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please check your credentials or sign up.";
      }
      setIsRegistering(false);
      
      Alert.alert('Login Error', errorMessage);
    }
  };
  
  
  
  
  
  return (
    <View style={styles.loginScreen}>
      <Image source={require('../../assets/images/top1.png')} style={styles.group} />
      <Image source={require('../../assets/images/top2.png')} style={styles.img} />
      <View style={styles.container}>
        <Text style={styles.textWrapper}>Log In!</Text>
        <View style={styles.overlap}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelWrapper}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            </View>
            <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
        />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.inputLabelWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
            </View>
            <TextInput
  style={styles.input}
  placeholder="Enter password"
  secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
  value={password}
  onChangeText={setPassword}
/>
<TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
  <FontAwesome
    name={showPassword ? 'eye-slash' : 'eye'}
    size={24}
    color="#3abbd7"
  />
</TouchableOpacity>

          </View>
          <TouchableOpacity
  onPress={handleLogin}
  style={[styles.button, isRegistering && styles.disabledButton]}
  disabled={isRegistering}
>
  {isRegistering ? (
    <ActivityIndicator color="#ffffff" size="small" />
  ) : (
    <Text style={styles.buttonText}>Log In</Text>
  )}
</TouchableOpacity>

          <TouchableOpacity onPress={()=>{
            navigation.navigate("ForgotPwdScreen")
          }}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dontHaveAccount}>
          <Text style={styles.span}>Don’t have an account? </Text>
          <TouchableOpacity onPress={()=>{
            navigation.navigate("SignupScreen")
          }} >
          <Text style={styles.signUp}>Sign up</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginScreen: {
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
  container: {
    marginTop:hp('15%'),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    color: '#29899e',
    fontSize: hp('4%'),
    fontWeight: '700',
  },
  overlap: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    width: wp('80%'),
  },
  inputWrapper: {
    marginBottom: hp('1%'),
  },
  inputLabelWrapper: {
    marginBottom: hp('0.5%'),
  },
  inputLabel: {
    color: '#565353',
    fontSize: hp('2%'),
    fontWeight: '700',
  },
  input: {
    borderColor: '#3abbd7',
    borderRadius: 10,
    borderWidth: 1,
    height: hp('6%'),
    paddingLeft: wp('3%'),
    paddingRight: wp('6%'),
  },
  button: {
    backgroundColor: 'rgb(85.65, 224.52, 255)',
    borderRadius: 15,
    height: hp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: hp('2.5%'),
    fontWeight: '700',
  },
  forgotPassword: {
    color: '#3abbd7',
    fontSize: hp('2%'),
    fontWeight: '700',
    marginTop: hp('1.5%'),
  },
  dontHaveAccount: {
    fontSize: hp('1.5%'),
    fontWeight: '700',
    marginTop: hp('3%'),
  },
  span: {
    color: '#565353',
  },
  signUp: {
    color: '#3abbd7',
  },
  passwordToggle: {
    position: 'absolute',
    top: hp('5%'),
    right: wp('3%'),
  },
  
});

export default LoginScreen;

import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { BackHandler, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


export const SignupScreen = ({navigation}) => {
  const [showPassword, setShowPassword] = useState(false);
   const [showCPassword, setShowCPassword] = useState(false);

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
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
  
    // Password validation regular expression
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{9,}$/;
  
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 9 characters long and contain at least one special character and one number."
      );
      return;
    }
  
    try {
      const auth = getAuth(); // Get the authentication instance
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed up successfully:", user.uid);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigation.navigate("Query", {
        email: email,
        id: user.uid,
      });
      // You can navigate to another screen or perform other actions upon successful sign-up
    } catch (error) {
      let errorMessage =
        "An error occurred while signing up. Please try again later.";
  
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "The email address is already in use by another account.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password should be at least 6 characters long.";
      }
  
      alert(errorMessage);
    }
  };
  
  
  return (
    <View style={styles.signupScreen}>
      <Image source={require('../../assets/images/top1.png')} style={styles.group} />
      <Image source={require('../../assets/images/top2.png')} style={styles.img} />
      <Text style={styles.textWrapper}>Sign Up</Text>
      <View style={styles.container}>
        <View style={styles.overlap}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
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
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter confirm password"
              secureTextEntry={showCPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowCPassword(!showCPassword)} style={styles.passwordToggle}>
  <FontAwesome
    name={showCPassword? 'eye-slash' : 'eye'}
    size={24}
    color="#3abbd7"
  />
</TouchableOpacity>
          </View>
          <Text style={styles.policyText}>I accept the policy and terms.</Text>
          <TouchableOpacity
           onPress={handleSignUp}
           style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.alreadyHaveAccount}>
          <Text style={styles.span}>Already have an account? </Text>
          <TouchableOpacity  onPress={()=>{
            navigation.navigate("LoginScreen")
          }}>
          <Text style={styles.textWrapper6}>Login</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  signupScreen: {
    backgroundColor: '#ffffff',
    flex: 1,
    alignItems: 'center',
  },
  group: {
    height: hp('25%'),
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
    fontSize: hp('3%'),
    fontWeight: '700',
    marginTop: hp('5%'),
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:80,
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
  policyText: {
    color: '#565353',
    fontSize: hp('1.5%'),
    fontWeight: '700',
    marginTop: hp('2%'),
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
  textWrapper6: {
    color: '#3abbd7',
  },
  passwordToggle: {
    position: 'absolute',
    top: hp('3%'),
    right: wp('3%'),
  },
});

export default SignupScreen;

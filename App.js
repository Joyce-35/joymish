import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as firebase from 'firebase/app';
import React from 'react';
import Page1 from './Components/Navigation/Page1';
import ClientRegister from './Components/Page1/ClientRegister';
import ForgotPwdScreen from './Components/Page1/ForgetPassword';
import LoginScreen from './Components/Page1/Login';
import Query from './Components/Page1/QueryPage';
import SignupScreen from './Components/Page1/Signup';
import WorkerRegister from './Components/Page1/WorkerRigister';
import SplashPage from './Components/otherComponent/SplashScreen';
import BrowseWorker from './Components/page2/BowseWorker';
import Request from './Components/page2/Request/Request';
import WorkerList from './Components/page2/WorkerList';
import { firebaseConfig } from './firebaseConfig'; // Import the Firebase config


  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  const Stack = createStackNavigator();

const App = () => {
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplahScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplahScreen" component={SplashPage} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ForgotPwdScreen" component={ForgotPwdScreen} />
      <Stack.Screen name="Query" component={Query} />
      <Stack.Screen name="ClientRegister" component={ClientRegister} />
      <Stack.Screen name="WorkerRegister" component={WorkerRegister} />
      <Stack.Screen name="WorkerList" component={WorkerList} />
      <Stack.Screen name="BookingsWorker" component={Request} />
      <Stack.Screen name="BrowseWorker" component={BrowseWorker} />
        <Stack.Screen name="Main" component={Page1} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

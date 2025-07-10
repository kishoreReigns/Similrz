import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/images/logo.svg';
import StartupIllustrator from '../../assets/images/startup-illustration.svg'
import SubmitButton from '../../common/SubmitButton';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

//android 575869349702-fbvllfie5k8u7o2765valpoh63602hqm.apps.googleusercontent.com
WebBrowser.maybeCompleteAuthSession();

type StartupScreenProp = NativeStackNavigationProp<RootStackParamList, 'Startup'>;

const StartupPage = () => {
  const navigation = useNavigation<StartupScreenProp>();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Google Auth code moved from LoginPage
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '575869349702-fbvllfie5k8u7o2765valpoh63602hqm.apps.googleusercontent.com',
    // Optionally add iosClientId, androidClientId, webClientId if needed for multi-platform
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      // Fetch user info with the access token
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then(res => res.json())
          .then(user => {
            console.log('Google user email:', user.email);
            alert(`Welcome, ${user.email}!`);
            // Here you can handle user info (e.g., save to state, navigate, etc.)
          })
          .catch(() => alert('Failed to fetch user info.'));
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
     <View style={styles.similrzLogo}>
        <Logo width={70} height={70} />
     </View>
     <View style={styles.title}>
        <Text style={styles.sharedValuesText}>
          Communities of <Text style={styles.orangeText}>Shared Values</Text>
        </Text>
        <Text style = {styles.growtext}>Let's <Text style={[styles.orangeText]}>Grow Positively & Intentionally Together</Text></Text>
     </View>
     <View>
        <StartupIllustrator width={300} height={300} />
     </View>
      <View style={{width: '90%'}}>
        <SubmitButton style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
        </SubmitButton>
        <SubmitButton style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.buttonText, styles.signupButtonText]}>Signup</Text>
        </SubmitButton>
        <Pressable style={styles.googleButton} onPress={() => promptAsync()} disabled={!request}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StartupPage;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  title: { fontSize: 24, padding:20 },
  button: {
    marginVertical: 10,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d3d3d3', // light gray
  },
  signupButton: {
    backgroundColor: '#FC6000', // orange
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
   // fontWeight: 'bold',
  },
  loginButtonText: {
    color: '#222', // dark text for white button
  },
  signupButtonText: {
    color: '#fff', // white text for orange button
  },
  orangeText: {
    color: '#FC6000', // orange
    fontWeight: 'bold',
  },
  similrzLogo:{
    marginBottom:5,
  },
  sharedValuesText:{
    fontSize: 22,
  },
  growtext:{
    marginLeft: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    padding: 12,
    marginTop: 30,
    width: 250,
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    color: '#222',
    marginRight: 10,
    fontWeight: 'bold',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#222',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubmitButton from '../../common/SubmitButton';
import Logo from '../../assets/images/logo.svg';
import Image1 from '../../assets/images/image1.svg';
import Image2 from '../../assets/images/image2.svg';
import Image3 from '../../assets/images/image3.svg';
import Image4 from '../../assets/images/image4.svg';
import Image5 from '../../assets/images/image5.svg';
import Image6 from '../../assets/images/image6.svg';
import Image8 from '../../assets/images/userimg8.svg';
import { loginService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import Toast, { ToastConfigParams } from 'react-native-toast-message';

const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      height: 20,
      width: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#FC6000',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    }}
    accessibilityRole="radio"
    accessibilityState={{ selected }}
  >
    {selected ? (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: '#FC6000',
        }}
      />
    ) : null}
  </TouchableOpacity>
);

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const LoginPage = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(true);
  const [userDetail, setUserDetail] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLogin = async () => {
    setLoading(true);
    const payload = { userName: email, password, rememberMe };
    console.log('Login API payload:', payload);
    const response = await loginService(payload);
    console.log('Login API response:', response);
    if (response.userId == null) {
      Toast.show({
        type: 'error',
        text1: 'Enter the valid details',
      });
      setLoading(false);
      return;
    }
    setUserDetail(response.userDetail);
    try {
      await AsyncStorage.setItem('userDetail', JSON.stringify(response.userDetail));
      const stored = await AsyncStorage.getItem('userDetail');
      await AsyncStorage.setItem('AuthToken', JSON.stringify(response.authToken));
      const authToken = await AsyncStorage.getItem('AuthToken');
      console.log("authToken",authToken);
      console.log('Stored userDetail in AsyncStorage:', stored);
    } catch (e) {
      console.error('AsyncStorage error:', e);
    }
    setLoading(false);
    if (response.userDetail?.userProfile === true) {
      navigation.navigate('Home');
    }
  };

  const toastConfig = {
    error: (params: ToastConfigParams<any>) => (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }}>
        <Logo width={28} height={28} style={{ marginRight: 10 }} />
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{params.text1}</Text>
      </View>
    ),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topContainer}>
            <View style={styles.logoSection}>
              <Logo width={70} height={70} />
            </View>
            <View style={styles.avatars}>
              <Image1 style={styles.avatar1} width={60} height={60} />
              <Image2 style={styles.avatar2} width={50} height={50} />
              <Image3 style={styles.avatar3} width={70} height={60} />
              <Image4 style={styles.avatar4} width={60} height={60} />
              <Image5 style={styles.avatar5} width={45} height={45} />
              <Image6 style={styles.avatar6} width={60} height={60} />
              <Image8 style={styles.avatar7} width={70} height={70} />
            </View>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.title}>Login to continue</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <View style={{ position: 'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 15, top: 15 }}
                onPress={() => setShowPassword(prev => !prev)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.rememberContainer}>
              <RadioButton
                selected={rememberMe}
                onPress={() => {}}
              />
              <Text style={styles.rememberText}>Remember me</Text>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <SubmitButton
              style={[styles.button, styles.signupButton]}
              onPress={handleLogin}
            >
              <Text
                style={[styles.buttonText, styles.signupButtonText]}
              >
                Login
              </Text>
            </SubmitButton>
            <Text style={styles.signupText}>
              Don't have any account?{' '}
              <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>Signup</Text>
            </Text>
          </View>
          {loading && (
  <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 999}}>
    <Text style={{fontSize: 18, color: '#FC6000', marginBottom: 10}}>Loading...</Text>
    <View style={{width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{backgroundColor: '#FC6000', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 24}}>...</Text>
      </View>
    </View>
  </View>
)}
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} position="bottom" />
    </SafeAreaView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  topContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  avatars: {
    flex: 1,
    position: 'relative',
  },
  avatar1: { position: 'absolute', top: 10, right: 10 },
  avatar2: { position: 'absolute', top: 70, right: 60 },
  avatar3: { position: 'absolute', top: 40, right: 130 },
  avatar4: { position: 'absolute', top: 120, right: 10 },
  avatar5: { position: 'absolute', top: 180, right: 70 },
  avatar6: { position: 'absolute', top: 160, right: 110 },
  avatar7: { position: 'absolute', top: 200, right: 30 },

  loginContainer: {
    marginTop: 300,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberText: {
    marginLeft: 8,
    flex: 1,
  },
  signupButton: {
    backgroundColor: '#FC6000', // orange
  },
  forgotPassword: {
    position: 'absolute',
    right: 0,
  },
  forgotPasswordText: {
    color: '#b45309',
    fontWeight: '500',
  },
  loginButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff', // white text for orange button
  },
  button: {
    marginVertical: 10,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signupText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  signupLink: {
    color: '#b45309',
    fontWeight: '600',
  },
});

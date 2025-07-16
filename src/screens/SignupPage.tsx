import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Platform,
} from 'react-native';
//import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import countryJson from '../../assets/country_dial_info.json';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Toast from 'react-native-root-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { registerUser } from '../services/authService';

// Convert the JSON to the format needed for the picker
const countryData = countryJson.map((item: any) => ({
  code: item.dial_code,
  name: item.name,
  flag: item.flag || '', // Use 'flag' property from JSON
}));

const SignupScreen = () => {
  const [notify, setNotify] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryData.find(c => c.code === '+91') || countryData[0]); // Default to India if present
  const [searchText, setSearchText] = useState('');
  const [profileName, setProfileName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    profileName?: string;
    mobileNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    referralCode?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Signup'>>();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Filter countries by search text
  const filteredCountries = countryData.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const validate = () => {
    const newErrors: any = {};
    // Profile Name validation
    if (!profileName.trim()) newErrors.profileName = 'Profile name is required';
    // Mobile Number validation
    if (!mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{7,15}$/.test(mobileNumber.trim())) newErrors.mobileNumber = 'Enter a valid mobile number';
    else if (/^(0+)/.test(mobileNumber.trim())) newErrors.mobileNumber = 'Mobile number should not start with 0';
    else if (/^(\d)\1{4,}$/.test(mobileNumber.trim())) newErrors.mobileNumber = 'Mobile number cannot have same digit repeated 5 times';
    // Email validation
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(email.trim())) newErrors.email = 'Enter a valid email';
    // Password validation
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    // Confirm Password validation
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    // Terms validation
    if (!termsAccepted) newErrors.terms = 'You must accept the terms';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Toast.show('Please correct the highlighted fields.', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#FC6000',
        textColor: '#fff',
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validate()) {
      setLoading(true);
      const userData = {
        id: 0,
        userName: profileName,
        email: email,
        password: password,
        mobileNumber: mobileNumber,
        countryCode: selectedCountry.code,
        termsAndConditions: termsAccepted,
        OptNotifications: notify,
        referralCode: referralCode,
      };
      console.log("userData:", userData);
      
      try {
        const res = await registerUser(userData);
        setLoading(false);
        if (!res.error) {
          Toast.show('Registration successful', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            backgroundColor: '#4BB543',
            textColor: '#fff',
          });
          navigation.navigate('Login');
        } else {
          Toast.show(res.error, {
            duration: Toast.durations.SHORT,
            position: Toast.positions.BOTTOM,
            backgroundColor: '#FC6000',
            textColor: '#fff',
          });
        }
      } catch (err) {
        setLoading(false);
        Toast.show('Registration failed', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          backgroundColor: '#FC6000',
          textColor: '#fff',
        });
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={40}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Signup to Login</Text>

      {/* Profile Name */}
      <View style={[styles.inputWrapper, errors.profileName && styles.errorWrapper]}>
        <TextInput
          placeholder="Profile Name"
          style={[styles.input, errors.profileName && styles.errorInput]}
          value={profileName}
          onChangeText={setProfileName}
        />
        <Icon name="person-outline" size={20} color="#888" style={styles.icon} />
        {errors.profileName && <Text style={{ color: 'red', fontSize: 12 }}>{errors.profileName}</Text>}
      </View>

      {/* Mobile Number */}
      <View style={[styles.inputWrapper, errors.mobileNumber && styles.errorWrapper]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setCountryModalVisible(true)}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
            </View>
          </TouchableOpacity>
          <TextInput
            placeholder="Mobile Number"
            style={[styles.input, { flex: 1, width: undefined }, errors.mobileNumber && styles.errorInput]}
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
          <Icon name="smartphone" size={20} color="#888" style={styles.icon} />
        </View>
        {errors.mobileNumber && <Text style={{ color: 'red', fontSize: 12 }}>{errors.mobileNumber}</Text>}
      </View>
      <Modal
        visible={countryModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCountryModalVisible(false)} style={styles.backButton}>
              <Icon name="arrow-back" size={28} color="#222" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Country</Text>
          </View>
          {/* Search Bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, position: 'relative' }}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search country"
              value={searchText}
              onChangeText={text => setSearchText(text)}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 10,
                fontSize: 16,
                backgroundColor: '#f9f9f9',
                paddingRight: 40, // space for clear button
              }}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  if (searchInputRef && searchInputRef.current) {
                    searchInputRef.current.clear();
                    searchInputRef.current.focus();
                  }
                }}
                style={{
                  position: 'absolute',
                  right: 28,
                  top: 18,
                  zIndex: 1,
                }}
                accessibilityLabel="Clear search"
              >
                <Icon name="close" size={22} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={item => item.code + item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.countryItem}
                onPress={() => {
                  setSelectedCountry(item);
                  setCountryModalVisible(false);
                  setSearchText('');
                }}
              >
                <Text style={styles.flagText}>{item.flag}</Text>
                <Text style={styles.countryNameText}>{item.name}</Text>
                <Text style={styles.countryCodeText}>{item.code}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.countryList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Opt-in Notifications */}
      <View style={styles.checkboxRow}>
        {/* <CheckBox
        value={notify}
        onValueChange={setNotify}
        tintColors={{ true: '#b45309', false: '#999' }}
      /> */}
        <Text style={styles.checkboxLabel}>Opt-in for Notifications</Text>
      </View>

      {/* Email */}
      <View style={[styles.inputWrapper, errors.email && styles.errorWrapper]}>
        <TextInput
          placeholder="Email"
          style={[styles.input, errors.email && styles.errorInput]}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Icon name="email" size={20} color="#888" style={styles.icon} />
        {errors.email && <Text style={{ color: 'red', fontSize: 12 }}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View style={[styles.inputWrapper, errors.password && styles.errorWrapper]}>
        <TextInput
          placeholder="Password"
          style={[styles.input, errors.password && styles.errorInput]}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.icon, { right: 40 }]}
          onPress={() => setShowPassword(v => !v)}
        >
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#888" />
        </TouchableOpacity>
        <Icon name="lock" size={20} color="#888" style={styles.icon} />
        {errors.password && <Text style={{ color: 'red', fontSize: 12 }}>{errors.password}</Text>}
      </View>

      {/* Confirm Password */}
      <View style={[styles.inputWrapper, errors.confirmPassword && styles.errorWrapper]}>
        <TextInput
          placeholder="Confirm Password"
          style={[styles.input, errors.confirmPassword && styles.errorInput]}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={[styles.icon, { right: 40 }]}
          onPress={() => setShowConfirmPassword(v => !v)}
        >
          <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={22} color="#888" />
        </TouchableOpacity>
        <Icon name="lock" size={20} color="#888" style={styles.icon} />
        {errors.confirmPassword && <Text style={{ color: 'red', fontSize: 12 }}>{errors.confirmPassword}</Text>}
      </View>

      {/* Referral Code */}
      <View style={[styles.inputWrapper, errors.referralCode && styles.errorWrapper]}>
        <TextInput
          placeholder="Referral Code (optional)"
          style={[styles.input, errors.referralCode && styles.errorInput]}
          value={referralCode}
          onChangeText={setReferralCode}
        />
        <Icon name="code" size={20} color="#888" style={styles.icon} />
        {errors.referralCode && <Text style={{ color: 'red', fontSize: 12 }}>{errors.referralCode}</Text>}
      </View>

      {/* Terms Checkbox */}
      <View style={[styles.checkboxRow, errors.terms && styles.errorWrapper]}>
        <TouchableOpacity
          style={styles.radioBox}
          onPress={() => setTermsAccepted(!termsAccepted)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
        >
          <View style={[styles.radioOuter, termsAccepted && styles.radioOuterChecked]}>
            {termsAccepted && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          I understand and accept the{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            terms & conditions
          </Text>
        </Text>
        {errors.terms && <Text style={{ color: 'red', fontSize: 12, marginLeft: 8 }}>{errors.terms}</Text>}
      </View>

      {/* Signup Button (Orange) */}
      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupButtonText}>Signup</Text>
      </TouchableOpacity>

      {/* Login Redirect */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </Text>

      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', zIndex: 99 }}>
          <Text style={{ color: '#FC6000', fontSize: 18, fontWeight: 'bold' }}>Registering...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 15 : 10,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 18 : 13,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 5,
  },
  termsText: {
    fontSize: 14,
    flexShrink: 1,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#FFA500', // Solid orange
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 15,
  },
  loginLink: {
    color: '#b45309',
    fontWeight: 'bold',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
    minWidth: 60,
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 26,
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FC6000',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    marginTop: 100,
    borderRadius: 10,
    padding: 10,
    maxHeight: 350,
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#222',
  },
  countryList: {
    paddingBottom: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  countryNameText: {
    flex: 1,
    fontSize: 17,
    marginLeft: 8,
    color: '#222',
    fontWeight: '500',
  },
  radioBox: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#888', // changed to gray
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOuterChecked: {
    borderColor: '#b45309',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FC6000',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    width: '100%',
    paddingTop: 40, // Increased top padding for equal spacing
    paddingBottom: 40, // Increased bottom padding for equal spacing
    paddingHorizontal: 20,
  },
  errorWrapper: {
    borderColor: 'red',
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 2,
  },
});

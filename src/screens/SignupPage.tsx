import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SignupPage = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Signup Page</Text>
  </View>
);

export default SignupPage;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});

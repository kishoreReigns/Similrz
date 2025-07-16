import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatPage = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Chat Page</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 22,
    color: '#FC6000',
    fontWeight: 'bold',
  },
});

export default ChatPage;

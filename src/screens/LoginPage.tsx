import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginPage = () => {
    const navigation = useNavigation();
    React.useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
      }, [navigation]);

    return (
      <View style={styles.container}>
        <Text style={styles.text}>Login Page</Text>
      </View>
    );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});

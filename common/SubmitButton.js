import { Pressable, StyleSheet, View } from "react-native";

export default function SubmitButton({ children, style, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        style,
        pressed && { opacity: 0.7, backgroundColor: "#e0e0e0" }, // simple ripple-like effect
      ]}
      android_ripple={{ color: "#ccc" }}
      onPress={onPress}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}

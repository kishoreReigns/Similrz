import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Animated, Easing, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DUMMY_PROFILE_IMAGE = 'https://ui-avatars.com/api/?name=User&background=FC6000&color=fff';
const SCREEN_WIDTH = require('react-native').Dimensions.get('window').width;

type Story = {
  images?: string[];
  image?: string;
  description?: string;
};

type StoryPageRouteParams = {
  story?: Story;
};

const StoryPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { story } = (route.params as StoryPageRouteParams) || {};

  const progressAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start(() => {
      navigation.goBack();
    });
    return () => progressAnim.setValue(0);
  }, [navigation, progressAnim]);

  const images = story?.images && story.images.length > 0 ? story.images : story?.image ? [story.image] : [DUMMY_PROFILE_IMAGE];
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = React.useRef<null | any>(null);

  // Auto progress and dismiss logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      } else {
        navigation.goBack();
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentIndex, images.length, navigation]);

  // Tap navigation
  const handleImageTap = (evt: any) => {
    const { locationX, width } = evt.nativeEvent;
    if (locationX > width / 2) {
      // Right side tap
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      }
    } else {
      // Left side tap
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
      }
    }
  };

  // Swipe navigation
  const handleMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(newIndex);
  };

  const [reply, setReply] = React.useState('');
  const handleSendReply = () => {
    // You can handle the reply logic here (e.g., send to backend)
    setReply('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
      {/* Story Images Slide View */}
      <View style={[styles.imageContainer, { width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: SCREEN_WIDTH }}>
              <Image source={{ uri: item }} style={{ width: SCREEN_WIDTH * 0.85, height: 320, borderRadius: 16, backgroundColor: '#eee' }} resizeMode="contain" />
            </View>
          )}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          extraData={currentIndex}
        />
        {story?.description ? (
          <Text style={styles.description}>{story.description}</Text>
        ) : null}
      </View>
      {/* Reply Input Fixed at Bottom */}
      <View style={styles.replyBarWrapper}>
        <View style={styles.replyInputWrapper}>
          <TextInput
            style={styles.replyInput}
            placeholder="Reply to story..."
            value={reply}
            onChangeText={setReply}
            returnKeyType="send"
            onSubmitEditing={handleSendReply}
          />
          <TouchableOpacity onPress={handleSendReply} style={styles.sendButton}>
            <Icon name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginTop: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#FC6000',
    borderRadius: 3,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center', // Center the image vertically
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 0,
    paddingBottom: 0,
  },
  storyImage: {
    width: '100%',
    height: 350,
    borderRadius: 0,
    marginTop: 0,
    backgroundColor: '#eee',
  },
  description: {
    marginTop: 12,
    fontSize: 18,
    color: '#222',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  replyBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    paddingHorizontal: 18,
    paddingBottom: 10,
    paddingTop: 16, // Added top padding for centering
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12, // Increased vertical padding for centering
    justifyContent: 'center',
  },
  replyInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 22,
    paddingHorizontal: 8,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#FC6000',
    borderRadius: 22,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  footer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoryPage;

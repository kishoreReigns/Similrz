import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SidebarMenu from '../../common/SidebarMenu';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfilePic } from '../services/authService';
import { getAllPost, likeOrDisLikePost } from '../services/homeService';
import NetworkPage from '../screens/NetworkPage';
import PostPage from '../screens/PostPage';
import ChatPage from '../screens/ChatPage';
import EventsPage from '../screens/EventsPage';
import ProfilePage from './ProfilePage';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'network', label: 'Network', icon: 'people' },
  { key: 'post', label: 'Post', icon: 'post-add' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'events', label: 'Events', icon: 'event' },
];

const DUMMY_PROFILE_IMAGE = 'https://ui-avatars.com/api/?name=User&background=FC6000&color=fff';
const SCREEN_WIDTH = Dimensions.get('window').width;

interface PostFile {
  fileUrl: string;
  // add other fields if needed
}
interface Post {
  id: number;
  userName: string;
  time: string;
  profilePicUrl?: string;
  postFiles?: PostFile[];
  postLikes?: any[] | null;
  textCode?: string;
  like?: boolean; // true if liked by current user
  likesCount?: number; // total likes
  likeId?: number; // id of the like row for current user
  // add other fields as needed
}

const HomePage = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState('home');
  const [userDetail, setUserDetail] = useState<any>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [postList, setPostList] = useState<Post[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [isGroupOnly, setIsGroupOnly] = useState(1); // default to 1 (number)
  const [imageIndexes, setImageIndexes] = useState<{ [postId: number]: number }>({});
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const [heartAnim, setHeartAnim] = useState<{ [postId: number]: Animated.Value }>({});
  const [showHeart, setShowHeart] = useState<{ [postId: number]: boolean }>({});

  useFocusEffect(
    React.useCallback(() => {
      setSelectedTab('home');
      // Fetch user profile pic if userDetail is available
      const fetchProfilePic = async () => {
        let detail = null;
        try {
          detail = localStorage.getItem('userDetail');
        } catch (e) {
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            detail = await AsyncStorage.getItem('userDetail');
          } catch {}
        }
        if (detail) {
          try {
            const parsed = JSON.parse(detail);
            console.log('fetchProfilePic parsed:', parsed);
            if (parsed?.id) {
              const picRes = await getUserProfilePic(parsed.id);
              //console.log('fetchProfilePic picRes:', picRes);
              
              if (picRes && picRes.profilePicUrl) {
                setProfilePic(picRes.profilePicUrl);
              } else {
                setProfilePic(null);
              }
            }
          } catch (err) {
            console.log('fetchProfilePic error:', err);
            setProfilePic(null);
          }
        }
      };
      fetchProfilePic();
    }, [userDetail]) // Only run when userDetail changes
  );

  useEffect(() => {
    // Try to get userDetail from localStorage (web) or AsyncStorage (React Native)
    const getUserDetail = async () => {
      let detail = null;
      try {
        // Try web localStorage first
        detail = localStorage.getItem('userDetail');
      } catch (e) {
        // Fallback for React Native
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          detail = await AsyncStorage.getItem('userDetail');
        } catch {}
      }
      if (detail) {
        try {
          const parsed = JSON.parse(detail);
          setUserDetail(parsed);
        } catch {
          setUserDetail(detail);
        }
      }
    };
    getUserDetail();
  }, []);

  useEffect(() => {
    // Fetch posts only once when HomePage is mounted and userDetail is set
    if (!userDetail || !userDetail.id) return;
    const fetchPosts = async () => {
      console.log('pageNumber', pageNumber);
      try {
        const res = await getAllPost(userDetail.id, 1, isGroupOnly); // Always fetch page 1 only
        setPostList(Array.isArray(res) ? res : []);
        console.log('postList', res);
      } catch (err) {
        console.log('fetchPosts error:', err);
      }
    };
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDetail, isGroupOnly]); // Only run once when userDetail is set

  // Function to load more posts (pagination)
  const loadMorePosts = async () => {
    if (!userDetail || !userDetail.id) return;
    const nextPage = pageNumber + 1;
    try {
      const res = await getAllPost(userDetail.id, nextPage, isGroupOnly);
      setPostList(prev => [...prev, ...(Array.isArray(res) ? res : [])]);
      setPageNumber(nextPage);
      console.log('postList', [...postList, ...(Array.isArray(res) ? res : [])]);
    } catch (err) {
      console.log('loadMorePosts error:', err);
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userDetail');
    } catch (e) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('userDetail');
      } catch {}
    }
    setSidebarVisible(false);
    navigation.navigate('Login');
  };

  const handleLikePress = async (postId: number) => {
    if (!userDetail || !userDetail.id) return;
    const post = postList.find(p => p.id === postId);
    if (!post) return;
    let isLiked = post.like === true;
    let likesCount = post.likesCount || 0;
    let payload;
    if (!isLiked) {
      // Like the post
      payload = {
        id: 0,
        postId: postId.toString(),
        userId: userDetail.id.toString(),
        isLiked: true,
      };
      await likeOrDisLikePost(payload);
      setPostList(prev => prev.map(p => p.id === postId ? { ...p, like: true, likesCount: likesCount + 1 } : p));
    } else {
      // Unlike the post
      payload = {
        id: post.likeId || 0,
        postId: postId.toString(),
        userId: userDetail.id.toString(),
        isLiked: false,
      };
      await likeOrDisLikePost(payload);
      setPostList(prev => prev.map(p => p.id === postId ? { ...p, like: false, likesCount: Math.max(0, likesCount - 1) } : p));
    }
  };

  // Helper: double tap detection
  let lastTap = 0;
  const handleDoubleTap = (postId: number) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      setShowHeart(prev => ({ ...prev, [postId]: true }));
      if (!heartAnim[postId]) heartAnim[postId] = new Animated.Value(0);
      Animated.sequence([
        Animated.timing(heartAnim[postId], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim[postId], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeart(prev => ({ ...prev, [postId]: false }));
      });
      // Only like if not already liked
      const post = postList.find(p => p.id === postId);
      if (post && !post.like) {
        handleLikePress(postId);
      }
    }
    lastTap = now;
  };

  useEffect(() => {
    // Initialize likedPosts state based on postList and userDetail
    if (!userDetail || !Array.isArray(postList)) return;
    const initialLiked: { [postId: number]: boolean } = {};
    postList.forEach(post => {
      // If postLikes contains current userId, mark as liked
      initialLiked[post.id] = Array.isArray(post.postLikes) && post.postLikes.some((like: any) => like.userId === userDetail.id);
    });
    setLikedPosts(initialLiked);
  }, [postList, userDetail]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with profile image */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <View style={styles.profileImageWrapper}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <Icon name="account-circle" size={40} color="#FC6000" />
            )}
          </View>
        </TouchableOpacity>
        {/* First group: QR and Search icons */}
        <View style={styles.headerIconsGroup1}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="qr-code" size={28} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="search" size={28} color="#888" />
          </TouchableOpacity>
        </View>
        {/* Gap between groups */}
        <View style={styles.headerIconsGap} />
        {/* Second group: Network, Chat, Notification icons */}
        <View style={styles.headerIconsGroup2}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="people" size={28} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="chat" size={28} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="notifications" size={28} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.container}>
        {selectedTab === 'home' && (
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 16, width: '100%' }}>
              {/* Stories Row (horizontal scroll) */}
              {/* <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333', marginLeft: 8 }}>
                Stories
              </Text> */}
              <View style={styles.storyRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyScroll}>
                  {[profilePic || DUMMY_PROFILE_IMAGE, ...Array(7).fill(DUMMY_PROFILE_IMAGE)].map((img, idx) => (
                    <View key={idx} style={styles.storyItem}>
                      <TouchableOpacity>
                        <Image
                          source={{ uri: img }}
                          style={[styles.storyImage, { borderColor: idx === 0 ? '#FC6000' : '#ccc' }]}
                        />
                        {idx === 0 && (
                          <View style={styles.storyAddIcon}>
                            <Icon name="add" size={16} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.storyLabel}>
                        {idx === 0 ? 'Your Story' : `User ${idx}`}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
            {/* Instagram-style Post Cards (vertical scroll) */}
            {postList.map((post) => (
              <View key={post.id} style={styles.postCard}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: post.profilePicUrl || DUMMY_PROFILE_IMAGE }}
                    style={styles.postHeaderImage}
                  />
                  <View style={styles.postHeaderText}>
                    <Text style={styles.postHeaderName}>{post.userName}</Text>
                    <Text style={styles.postHeaderTime}>{post.time}</Text>
                  </View>
                  <Icon name="more-vert" size={20} color="#555" />
                </View>
                {/* Post Images (swipe if multiple) */}
                {Array.isArray(post.postFiles) && post.postFiles.length > 0 ? (
                  <View>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      style={styles.postImageScroll}
                      contentContainerStyle={{ width: SCREEN_WIDTH * post.postFiles.length }}
                      onScroll={e => {
                        const scrollX = e.nativeEvent.contentOffset.x;
                        const idx = Math.round(scrollX / SCREEN_WIDTH);
                        setImageIndexes(prev => ({ ...prev, [post.id]: idx }));
                      }}
                      scrollEventThrottle={16}
                    >
                      {post.postFiles.map((file: any, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={1}
                          onPress={() => handleDoubleTap(post.id)}
                          style={{ width: SCREEN_WIDTH, height: 380 }}
                        >
                          <Image
                            source={{ uri: file.path }}
                            style={styles.postImageFull}
                            resizeMode="contain"
                          />
                          {showHeart[post.id] && (
                            <Animated.View
                              style={{
                                position: 'absolute',
                                top: '40%',
                                left: '40%',
                                zIndex: 10,
                                opacity: heartAnim[post.id] || 0,
                                transform: [{ scale: heartAnim[post.id] ? heartAnim[post.id].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) : 1 }],
                              }}
                            >
                              <Icon name="favorite" size={90} color="#FC6000" />
                            </Animated.View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {/* Bullets for images, only if more than one image */}
                    {post.postFiles.length > 1 && (
                      <View style={styles.bulletContainer}>
                        {post.postFiles.map((file: any, idx: number) => (
                          <View
                            key={idx}
                            style={[styles.bullet, (imageIndexes[post.id] ?? 0) === idx && styles.bulletActive]}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={1} onPress={() => handleDoubleTap(post.id)} style={{ width: SCREEN_WIDTH, height: 380 }}>
                    <Image
                      source={{ uri: DUMMY_PROFILE_IMAGE }}
                      style={styles.postImageFull}
                      resizeMode="contain"
                    />
                    {showHeart[post.id] && (
                      <Animated.View
                        style={{
                          position: 'absolute',
                          top: '40%',
                          left: '40%',
                          zIndex: 10,
                          opacity: heartAnim[post.id] || 0,
                          transform: [{ scale: heartAnim[post.id] ? heartAnim[post.id].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) : 1 }],
                        }}
                      >
                        <Icon name="favorite" size={90} color="#FC6000" />
                      </Animated.View>
                    )}
                  </TouchableOpacity>
                )}
                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity onPress={() => handleLikePress(post.id)}>
                    <Icon
                      name={post.like ? 'favorite' : 'favorite-border'}
                      size={26}
                      color={post.like ? '#FC6000' : '#888'}
                      style={{ marginRight: 16 }}
                    />
                  </TouchableOpacity>
                  <Icon name="chat-bubble-outline" size={26} color="#888" style={{ marginRight: 16 }} />
                  <Icon name="send" size={26} color="#888" />
                  <View style={{ flex: 1 }} />
                  <Icon name="bookmark-border" size={26} color="#888" />
                </View>
                {/* Post Likes & Caption */}
                <View style={styles.postLikes}>
                  <Text style={styles.postLikesText}>{post.likesCount || 0} likes</Text>
                  <Text style={styles.postCaption}>
                    <Text style={styles.postCaptionBold}>{post.userName} </Text>
                    {post.textCode || ''}
                  </Text>
                </View>
                {/* Comment Input */}
                <View style={styles.postCommentInput}>
                  <Image
                    source={{ uri: post.profilePicUrl || DUMMY_PROFILE_IMAGE }}
                    style={styles.postCommentImage}
                  />
                  <Text style={styles.postCommentText}>Add a comment...</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        {selectedTab === 'network' && <NetworkPage />}
        {selectedTab === 'post' && <PostPage />}
        {selectedTab === 'chat' && <ChatPage />}
        {selectedTab === 'events' && <EventsPage />}
        {selectedTab === 'profile' && <ProfilePage />}
      </View>
      <SidebarMenu
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={handleLogout}
        navigation={navigation}
      />
      <View style={[styles.tabBar, { paddingBottom: 24 }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={tab.icon}
              size={28}
              color={selectedTab === tab.key ? '#FC6000' : '#888'}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageWrapper: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  headerIconsGroup1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerIconsGap: {
    width: 32,
  },
  headerIconsGroup2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerIconBtn: {
    marginHorizontal: 4,
    padding: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingHorizontal: 0,
  },
  storyRow: {
    height: 80,
  },
  storyScroll: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
  storyAddIcon: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    backgroundColor: '#FC6000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  postCard: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 32,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  postHeaderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  postHeaderName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postHeaderTime: {
    color: '#888',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#ccc',
  },
  postImageScroll: {
    width: '100%',
    height: 380,
    backgroundColor: '#ccc',
    borderRadius: 0,
  },
  postImageFull: {
    width: SCREEN_WIDTH,
    height: 380,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  postLikes: {
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  postLikesText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  postCaption: {
    fontSize: 14,
  },
  postCaptionBold: {
    fontWeight: 'bold',
  },
  postCommentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  postCommentImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postCommentText: {
    color: '#888',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 24,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  tabIcon: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#FC6000',
    fontWeight: 'bold',
  },
  // Add styles for tab screens
  tabScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  tabScreenText: {
    fontSize: 22,
    color: '#FC6000',
    fontWeight: 'bold',
  },
  bulletContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  bulletActive: {
    backgroundColor: '#FC6000',
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
});

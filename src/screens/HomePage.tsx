import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Animated, TextInput, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SidebarMenu from '../../common/SidebarMenu';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfilePic } from '../services/authService';
import { getAllPost } from '../services/homeService';
import NetworkPage from '../screens/NetworkPage';
import ChatPage from '../screens/ChatPage';
import EventsPage from '../screens/EventsPage';
import ProfilePage from './ProfilePage';
import PostPage from './PostPage';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import StoryPage from './StoryPage';

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
  commentsCount?: number;
  PostCommets?: any[];
  commentName?: string;
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
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [commentModalAnim] = useState(new Animated.Value(0));
  const [commentInput, setCommentInput] = useState('');
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [storyModalVisible, setStoryModalVisible] = useState(false);
  const [viewStoryModalVisible, setViewStoryModalVisible] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [storyVideo, setStoryVideo] = useState<string | null>(null);
  const [storyDescription, setStoryDescription] = useState('');
  const [myStory, setMyStory] = useState<{ images?: string[]; image?: string; video?: string; description?: string } | null>(null);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

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

  // REMOVE: like and comment API calls from HomePage

  // Helper: double tap detection
  let lastTap = 0;
  const handleDoubleTap = (postId: number) => {
    const now = Date.now();
    const post = postList.find(p => p.id === postId);
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
      if (post && !post.like) {
        setPostList(prev => prev.map(p =>
          p.id === postId
            ? {
                ...p,
                like: true,
                likesCount: (p.likesCount || 0) + 1
              }
            : p
        ));
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

  useEffect(() => {
    if (commentModalVisible) {
      Animated.timing(commentModalAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(commentModalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [commentModalVisible]);

  const handleSendComment = async () => {
    if (!commentInput.trim() || !selectedPostForComments || !userDetail) return;
    // Simulate backend call to add comment
    const newComment = {
      userName: userDetail.userName || 'You',
      profilePicUrl: profilePic || DUMMY_PROFILE_IMAGE,
      text: commentInput.trim(),
    };
    // Update comments in selected post
    setPostList(prev => prev.map(post =>
      post.id === selectedPostForComments.id
        ? { ...post, PostCommets: [...(post.PostCommets || []), newComment], commentsCount: (post.commentsCount || 0) + 1 }
        : post
    ));
    setSelectedPostForComments(prev => prev ? { ...prev, PostCommets: [...(prev.PostCommets || []), newComment] } : prev);
    setCommentInput('');
  };

  // Add Story Modal logic
  const handlePickStoryImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setStoryImages(prev => [...prev, ...result.assets.map((a: any) => a.uri)]);
      setStoryVideo(null);
    }
  };
  const handlePickStoryVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setStoryVideo(result.assets[0].uri);
      setStoryImages([]);
    }
  };
  const handlePostStory = () => {
    if (storyImages.length === 0 && !storyVideo) return;
    setMyStory({ images: storyImages.length > 0 ? storyImages : undefined, video: storyVideo || undefined, description: storyDescription });
    setStoryModalVisible(false);
    setStoryImages([]);
    setStoryVideo(null);
    setStoryDescription('');
    // Show story immediately after posting
    setTimeout(() => {
      handleViewStory();
    }, 400); // slight delay to allow modal to close
  };

  // View Story Modal logic
  const handleViewStory = () => {
    if (!myStory) return;
    navigation.navigate('StoryPage', { story: myStory });
  };
  useEffect(() => {
    if (!viewStoryModalVisible && storyTimerRef.current) {
      clearInterval(storyTimerRef.current);
    }
  }, [viewStoryModalVisible]);

  // Move all tab content logic inside a function for clarity
  function renderTabContent() {
    if (selectedTab === 'home') {
      return (
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 16, width: '100%' }}>
            {/* Stories Row (horizontal scroll) */}
            <View style={styles.storyRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyScroll}>
                <View style={styles.storyItem}>
                  <TouchableOpacity onPress={myStory ? handleViewStory : () => setStoryModalVisible(true)}>
                    <Image
                      source={{ uri: myStory?.image || profilePic || DUMMY_PROFILE_IMAGE }}
                      style={[styles.storyImage, { borderColor: '#FC6000' }]}
                    />
                    <View style={styles.storyAddIcon}>
                      <Icon name="add" size={16} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.storyLabel}>Your Story</Text>
                </View>
                {/* Other stories (dummy) */}
                {Array(7).fill(DUMMY_PROFILE_IMAGE).map((img, idx) => (
                  <View key={idx} style={styles.storyItem}>
                    <TouchableOpacity>
                      <Image
                        source={{ uri: img }}
                        style={[styles.storyImage, { borderColor: '#ccc' }]}
                      />
                    </TouchableOpacity>
                    <Text style={styles.storyLabel}>{`User ${idx + 1}`}</Text>
                  </View>
                ))}
                {/* My Story profile icon (if posted) */}
                {myStory && (
                  <View style={styles.storyItem}>
                    <TouchableOpacity onPress={handleViewStory}>
                      <Image
                        source={{ uri: myStory.image || profilePic || DUMMY_PROFILE_IMAGE }}
                        style={[styles.storyImage, { borderColor: '#FC6000' }]} />
                    </TouchableOpacity>
                    <Text style={styles.storyLabel}>My Story</Text>
                  </View>
                )}
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
                        {file.type === 'video' ? (
                          <Video
                            source={{ uri: file.path }}
                            style={styles.postImageFull}
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={imageIndexes[post.id] === idx}
                            isLooping={false}
                            useNativeControls={true}
                          />
                        ) : (
                          <Image
                            source={{ uri: file.path }}
                            style={styles.postImageFull}
                            resizeMode="contain"
                          />
                        )}
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
                  {/* Bullets for images/videos, only if more than one */}
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
                </TouchableOpacity>
              )}
              {/* Post Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity onPress={() => {
                  setPostList(prev => prev.map(p =>
                    p.id === post.id
                      ? {
                          ...p,
                          like: !p.like,
                          likesCount: p.like
                            ? Math.max((p.likesCount || 1) - 1, 0)
                            : (p.likesCount || 0) + 1
                        }
                      : p
                  ));
                }}>
                  <Icon
                    name={post.like ? 'favorite' : 'favorite-border'}
                    size={26}
                    color={post.like ? '#FC6000' : '#888'}
                    style={{ marginRight: 16 }}
                  />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                  <TouchableOpacity onPress={() => { setSelectedPostForComments(post); setCommentModalVisible(true); }}>
                    <Icon name="chat-bubble-outline" size={26} color="#888" />
                  </TouchableOpacity>
                  {post.commentsCount ? (
                    <Text style={{ marginLeft: 4, color: '#888', fontWeight: 'bold', fontSize: 14 }}>{post.commentsCount}</Text>
                  ) : null}
                </View>
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
                <TouchableOpacity onPress={() => { setSelectedPostForComments(post); setCommentModalVisible(true); }}>
                  <Text style={styles.postCommentText}>Add a comment...</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      );
    }
    if (selectedTab === 'network') return <NetworkPage />;
    if (selectedTab === 'chat') return <ChatPage />;
    if (selectedTab === 'events') return <EventsPage />;
    if (selectedTab === 'profile') return <ProfilePage />;
    return null;
  }

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
        {renderTabContent()}
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
            onPress={() => {
              if (tab.key === 'post') {
                setPostModalVisible(true);
              } else {
                setSelectedTab(tab.key);
              }
            }}
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
      {/* Post Modal */}
      <PostPage
        onAddPost={(newPost) => {
          setPostList(prev => [newPost, ...prev]);
          setPostModalVisible(false);
        }}
        modalVisible={postModalVisible}
        setModalVisible={setPostModalVisible}
      />
      {/* Comment Modal */}
      {commentModalVisible && (
        <TouchableOpacity
          style={styles.bottomModalOverlay}
          activeOpacity={1}
          onPress={() => {
            Animated.timing(commentModalAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start(() => setCommentModalVisible(false));
          }}
        >
          <Animated.View
            style={{
              ...styles.bottomCommentModalContent,
              transform: [
                {
                  translateY: commentModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0], // Slide up from bottom
                  }),
                },
              ],
              opacity: commentModalAnim,
            }}
          >
            <View style={styles.bottomModalHeader}>
              <Text style={styles.commentModalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => {
                Animated.timing(commentModalAnim, {
                  toValue: 0,
                  duration: 250,
                  useNativeDriver: true,
                }).start(() => setCommentModalVisible(false));
              }} style={styles.closeModalBtn}>
                <Icon name="close" size={28} color="#FC6000" />
              </TouchableOpacity>
            </View>
            {/* Comment List */}
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 16 }}>
              {selectedPostForComments?.PostCommets?.length ? (
                selectedPostForComments.PostCommets.map((comment: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Image source={{ uri: comment.profilePicUrl || DUMMY_PROFILE_IMAGE }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{comment.userName}</Text>
                      <Text style={{ fontSize: 14, color: '#444' }}>{comment.text}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>No comments yet.</Text>
              )}
            </ScrollView>
            {/* Input Field & Send Icon */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
              style={{ width: '100%' }}
              enabled
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, paddingBottom: insets.bottom + 8, backgroundColor: '#fff' }}>
                <Image source={{ uri: profilePic || DUMMY_PROFILE_IMAGE }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 22, paddingHorizontal: 14 }}>
                  <TextInput
                    style={{ flex: 1, height: 38, fontSize: 16 }}
                    placeholder="Add a comment..."
                    value={commentInput}
                    onChangeText={setCommentInput}
                    onSubmitEditing={handleSendComment}
                    returnKeyType="send"
                  />
                  <TouchableOpacity onPress={handleSendComment} style={{ marginLeft: 8, height: 38, justifyContent: 'center' }}>
                    <Icon name="send" size={24} color={commentInput ? '#FC6000' : '#ccc'} />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableOpacity>
      )}
      {/* Add Story Modal */}
      <Modal visible={storyModalVisible} animationType="slide" transparent={false} onRequestClose={() => setStoryModalVisible(false)}>
        <View style={[styles.commentModalContent, { flex: 1, width: '100%', borderRadius: 0, padding: 0, alignItems: 'stretch', justifyContent: 'flex-start', backgroundColor: '#fff' }]}> 
          {/* Top Bar - Cancel left, Post right */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <TouchableOpacity onPress={() => setStoryModalVisible(false)}>
              <Icon name="close" size={28} color="#FC6000" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>Add Story</Text>
            <TouchableOpacity onPress={handlePostStory} style={{ backgroundColor: '#FC6000', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Post</Text>
            </TouchableOpacity>
          </View>
          {/* Picker Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 24 }}>
            <TouchableOpacity onPress={handlePickStoryImage} style={{ marginRight: 24, alignItems: 'center' }}>
              <Icon name="image" size={36} color="#FC6000" />
              <Text style={{ color: '#FC6000', marginTop: 4 }}>Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePickStoryVideo} style={{ alignItems: 'center' }}>
              <Icon name="videocam" size={36} color="#FC6000" />
              <Text style={{ color: '#FC6000', marginTop: 4 }}>Video</Text>
            </TouchableOpacity>
          </View>
          {/* Preview */}
          {storyImages.length > 0 && (
            <View style={{ alignItems: 'center', marginBottom: 16, width: '100%' }}>
              <FlatList
                data={storyImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={{ width: SCREEN_WIDTH, height: 220, borderRadius: 16 }} resizeMode="cover" />
                )}
                style={{ width: SCREEN_WIDTH, height: 220 }}
              />
            </View>
          )}
          {/* Description Input */}
          <View style={{ paddingHorizontal: 18, marginBottom: 24 }}>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 48, backgroundColor: '#f8f8f8' }}
              placeholder="Add a description..."
              value={storyDescription}
              onChangeText={setStoryDescription}
              multiline
            />
          </View>
        </View>
      </Modal>
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
    paddingLeft: 8, // Added left padding for profile image
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  commentModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  closeModalBtn: {
    marginTop: 24,
    padding: 10,
    backgroundColor: '#FC6000',
    borderRadius: 8,
  },
  closeModalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomModalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '5%', // covers 95% of the screen from the bottom (increased height)
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 999,
  },
  bottomCommentModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    width: '100%',
    minHeight: '95%',
    maxHeight: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DUMMY_PROFILE_IMAGE = 'https://ui-avatars.com/api/?name=User&background=FC6000&color=fff';

const PostPage = ({ onAddPost, modalVisible, setModalVisible, userProfilePic }: { onAddPost?: (post: any) => void, modalVisible?: boolean, setModalVisible?: (v: boolean) => void, userProfilePic?: string }) => {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]); // New state for videos
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages(result.assets.map((a: any) => a.uri));
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideos(result.assets.map((a: any) => a.uri));
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleRemoveVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  const handlePost = async () => {
    console.log("hitt");
    
    if ((images.length === 0 && videos.length === 0) || !description.trim()) return;
    setLoading(true);
    try {
      // Create a local post object
      const newPost = {
        id: Date.now(),
        userName: 'You',
        profilePicUrl: userProfilePic || DUMMY_PROFILE_IMAGE,
        postFiles: [
          ...images.map(img => ({ path: img, type: 'image' })),
          ...videos.map(vid => ({ path: vid, type: 'video', thumbnail: null })), // Add type: 'video'
        ],
        textCode: description,
        like: false,
        likesCount: 0,
        commentsCount: 0,
        PostCommets: [],
        time: 'Just now',
      };
      if (onAddPost) {
        onAddPost(newPost);
      }
      setImages([]);
      setVideos([]);
      setDescription('');
    } catch (err) {
      console.log('Local post error:', err);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={!!modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible && setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Top Bar - Cancel left, Post right */}
          <View style={styles.topBarOnlyPost}>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible && setModalVisible(false)}>
              <Icon name="close" size={28} color="#888" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.postBtnTop} onPress={handlePost}>
              <Text style={styles.postBtnTopText}>Post</Text>
            </TouchableOpacity>
          </View>
          {/* Profile Row */}
          <View style={styles.profileRowCustomNoGap}>
            <Image source={{ uri: userProfilePic || DUMMY_PROFILE_IMAGE }} style={styles.profileImageCustom} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileNameCustom}>sure</Text>
              <View style={styles.publicRow}>
                <Text style={styles.publicText}>Public</Text>
                <Icon name="arrow-drop-down" size={20} color="#bbb" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </View>
          {/* Gap between public and text box */}
          <View style={{ height: 16 }} />
          {/* Description Input */}
          <TextInput
            style={styles.inputCustomPadded}
            placeholder="Write something amazing!"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
          />
          {/* Selected Images Grid */}
          {images.length > 0 && (
            <View style={styles.imagesGridWrapper}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageTileWrapper}>
                  <Image source={{ uri: img }} style={styles.imageTile} />
                  <TouchableOpacity style={styles.removeImageBtnTile} onPress={() => handleRemoveImage(idx)}>
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {/* Selected Videos Grid */}
          {videos.length > 0 && (
            <View style={styles.imagesGridWrapper}>
              {videos.map((vid, idx) => (
                <View key={idx} style={styles.imageTileWrapper}>
                  <Icon name="videocam" size={32} color="#FC6000" style={{ alignSelf: 'center', marginTop: 18 }} />
                  <TouchableOpacity style={styles.removeImageBtnTile} onPress={() => handleRemoveVideo(idx)}>
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {/* Bottom Bar */}
          <View style={styles.bottomBarNoGap}>
            <TouchableOpacity onPress={takePhoto} style={styles.bottomIconBtn}>
              <Icon name="photo-camera" size={26} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.bottomIconBtn}>
              <Icon name="photo-library" size={26} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickVideo} style={styles.bottomIconBtn}>
              <Icon name="videocam" size={26} color="#888" />
            </TouchableOpacity>
            <View style={styles.bottomBarSpacer} />
            <Text style={styles.anyoneText}>Anyone</Text>
          </View>
          {/* Loader Overlay */}
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#FC6000" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    margin: 0,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  topBarOnlyPost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    height: 54,
  },
  postBtnTop: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginRight: 0,
    marginTop: 0,
  },
  postBtnTopText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileRowCustomNoGap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#fff',
    marginBottom: 0,
    margin: 0,
  },
  profileImageCustom: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eee',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#FC6000',
  },
  profileNameCustom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    margin: 0,
  },
  publicText: {
    fontSize: 13,
    color: '#888',
  },
  inputCustomPadded: {
    width: '100%',
    minHeight: 80,
    borderWidth: 0,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    color: '#222',
    alignSelf: 'stretch',
  },
  bottomBarNoGap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    margin: 0,
  },
  bottomIconBtn: {
    marginRight: 8,
    padding: 4,
  },
  bottomBarSpacer: {
    flex: 1,
  },
  anyoneText: {
    fontSize: 13,
    color: '#bbb',
    fontWeight: '500',
  },
  imagesGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  imageTileWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eaf3fa',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageTile: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageBtnTile: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FC6000',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 0,
    position: 'relative',
  },
  cancelModalBtn: {
    marginLeft: 8,
    marginTop: 8,
    padding: 4,
  },
});

export default PostPage;

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, getAllConnectionsCount } from '../services/profileService';
import { convertImageToBlob } from '../services/authService';

const dummyProfile = 'https://randomuser.me/api/portraits/men/1.jpg'; // dummy profile image
const dummyPost = 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=600&q=60';    // dummy post image

const posts = Array(9).fill(dummyPost); // 9 dummy posts

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = React.useState(dummyProfile);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [allConnectionCount, setAllConnectionCount] = React.useState({ postsCount: 0, connectionsCount: 0, followersCount: 0 });

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        let detail = null;
        try {
          detail = localStorage.getItem('userDetail');
        } catch (e) {
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            detail = await AsyncStorage.getItem('userDetail');
            console.log("details",detail);
            
          } catch {}
        }
        let userId = null;
        if (detail) {
          try {
            const parsed = JSON.parse(detail);
            userId = parsed?.id;
          } catch {}
        }
        if (userId) {
          const res = await getAllConnectionsCount(userId);
          if (res) {
            console.log('Connection counts:', res);
            
            setAllConnectionCount({
              postsCount: res.postsCount || 0,
              connectionsCount: res.connectionsCount || 0,
              followersCount: res.followersCount || 0,
            });
          }
        }
      } catch (err) {
        setAllConnectionCount({ postsCount: 0, connectionsCount: 0, followersCount: 0 });
      }
    };
    fetchCounts();
  }, []);

  const handlePickImage = async () => {
    setModalVisible(true);
  };

  const getUserId = async () => {
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
        return parsed?.id;
      } catch {
        return null;
      }
    }
    return null;
  };

  const pickFromGallery = async () => {
    setModalVisible(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      console.log('Permission to access gallery denied');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, // get base64 if needed
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      setProfileImage(uri);
      console.log('Picked image URL:', uri);

      // Fetch the image as a blob
      const response = await fetch(uri);
      let blob = await response.blob();

      // Set filename and type
      const fileName = `${Date.now()}.jpeg`;
      const fileType = 'image/jpeg';

      // For debugging: log the actual blob and filename
      console.log('imgBlob', blob);
      console.log('file', fileName);

      // Construct FormData
      const formData = new FormData();
      formData.append('image', blob, fileName);

      // Upload
      const userId = await getUserId();
      if (userId) {
        const res = await uploadImage(userId, formData);
        console.log('Upload response:', res);
      }
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      console.log('Permission to access camera denied');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, // get base64 if needed
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      setProfileImage(uri);
      console.log('Picked image URL:', uri);

      // Fetch the image as a blob
      const response = await fetch(uri);
      let blob = await response.blob();

      // Set filename and type
      const fileName = `${Date.now()}.jpeg`;
      const fileType = 'image/jpeg';

      // For debugging: log the actual blob and filename
      console.log('imgBlob', blob);
      console.log('file', fileName);

      // Construct FormData
      const formData = new FormData();
      formData.append('image', blob, fileName);

      // Upload
      const userId = await getUserId();
      if (userId) {
        const res = await uploadImage(userId, formData);
        console.log('Upload response:', res);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraIconContainer} onPress={handlePickImage}>
          <Ionicons name="camera" size={18} color="#fff" />
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Choose Option</Text>
              <TouchableOpacity style={styles.modalButton} onPress={pickFromGallery}>
                <Text style={styles.modalButtonText}>From Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
                <Text style={styles.modalButtonText}>Take Picture</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Text style={styles.username}>good</Text>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allConnectionCount.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allConnectionCount.connectionsCount}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{allConnectionCount.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tab} onPress={() => {/* TODO: Navigate to SimiPics */}}>
            <Text style={styles.tabText}>📷 SimiPics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => {/* TODO: Navigate to SimiTubes */}}>
            <Text style={styles.tabText}>🎥 SimiTubes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => {/* TODO: Navigate to SimiTexts */}}>
            <Text style={styles.tabText}>📝 SimiTexts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Grid */}
      <View style={styles.grid}>
        {posts.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.postImage} />
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 5,
    alignSelf: 'center',
    marginTop: -5,
  },
  username: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    width: '80%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  button: {
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 5,
    justifyContent: 'space-between',
  },
  postImage: {
    width: '32%',
    height: 100,
    marginVertical: 5,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#FC6000',
  },
  modalButton: {
    backgroundColor: '#FC6000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 10,
  },
  modalCancelText: {
    color: '#888',
    fontSize: 15,
  },
});

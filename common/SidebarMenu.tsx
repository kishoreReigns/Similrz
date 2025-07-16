import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SidebarMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  navigation?: any; // Add navigation prop
}

const MENU_ITEMS = [
  'Profile',
  'Invite Contacts',
  'My B:havior Card',
  'My Sharable',
  'Change Password',
  'App Feedback',
  'Alignment and Growth Feedback Summary',
  'Trust Scorecard',
  'Interest',
  'Account Deactivation',
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ visible, onClose, onLogout, navigation }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sidebarSafeArea}>
        <View style={styles.sidebarContent}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity key={item} style={styles.sidebarItem} onPress={() => {
              if (item === 'Profile') {
                // Navigate to ProfilePage
                if (typeof navigation !== 'undefined') {
                  navigation.navigate('Profile');
                }
              }
            }}>
              <Text style={styles.sidebarItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Icon name="logout" size={24} color="#FC6000" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeSidebar} onPress={onClose}>
            <Icon name="close" size={28} color="#FC6000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    zIndex: 999,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  sidebarSafeArea: {
    flex: 1,
    width: 220,
    height: '100%',
    backgroundColor: 'transparent',
  },
  sidebarContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 40,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  sidebarTitle: {
    color: '#FC6000',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FC6000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  closeSidebar: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
});

export default SidebarMenu;

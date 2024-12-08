import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface ProfileHeaderProps {
  profileImage: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileImage }) => {
  return (
    <View style={styles.cover}>
      <TouchableOpacity
        onPress={() => Alert.alert('Change Profile Picture')}
        style={styles.profileImageContainer}
      >
        <Image
          source={profileImage ? { uri: profileImage } : require('../../assets/images/default-profile.jpg')}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFillObject,
    height: 200,
    backgroundColor: '#A57A5A',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 1,
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 60,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
});

export default ProfileHeader;

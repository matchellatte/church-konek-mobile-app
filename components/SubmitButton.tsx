import React from 'react';
import { Platform, TouchableOpacity, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';

const { width } = Dimensions.get('window');

interface SubmitButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: object;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ label, onPress, disabled = false, style = {} }) => (
  <TouchableOpacity
    style={[styles.button, disabled ? styles.disabledButton : {}, style]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{label || 'Submit'}</Text> {/* Fallback to 'Submit' */}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    ...Platform.select({
      ios: {
        paddingVertical: 16,
      },
      android: {
        paddingVertical: 13,
      },
    }),
    backgroundColor: '#A57A5A',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    width: width - 40,
    alignSelf: 'center',
  },
  buttonText: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Light gray when disabled
  },
});

export default SubmitButton;

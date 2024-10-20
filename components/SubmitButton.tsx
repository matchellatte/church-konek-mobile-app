import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';

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
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6A5D43',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    width: width - 40,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9', // Light gray when disabled
  },
});

export default SubmitButton;

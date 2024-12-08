import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';

interface FormInputFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  multiline?: boolean; // Allow multiline property
}

const FormInputField: React.FC<FormInputFieldProps> = ({
  label,
  value,
  onChangeText,
  required = false,
  multiline = false,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline} // Apply multiline prop
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    ...Platform.select({
        ios: {
            fontSize: 13,
        },
        android: {
            fontSize: 12,
        },
    }),
    fontWeight: '500',
    color: '#4B3F3A',
    marginBottom: 8,
  },
  required: {
    color: 'red',
  },
  input: {
    ...Platform.select({
        ios: {
            padding: 12,
            fontSize: 16,
        },
        android: {
            padding: 12,
            fontSize: 13,
        },
    }),
    borderWidth: 1,
    borderColor: '#E2E4E5',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  multilineInput: {
    minHeight: 60, // Ensure enough height for multiline inputs
    textAlignVertical: 'top', // Ensure the text starts at the top for multiline
  },
});

export default FormInputField;

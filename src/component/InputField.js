import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';

const InputField = ({ label, value, onChangeText, placeholder, keyboardType }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#214937',
    padding: 10,
    borderRadius: 10,
    height: 50,
  },
});

export default InputField;

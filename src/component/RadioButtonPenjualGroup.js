import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RadioButtonPenjualGroup = ({ options, selectedValue, onSelect }) => {
  return (
    <View style={styles.radioGroup}>
      {options.map((option, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.radioButton} 
          onPress={() => onSelect(option)}
        >
          <View style={[styles.outerCircle, selectedValue === option.id && styles.selectedOuterCircle]}>
            {selectedValue === option.id && <View style={styles.innerCircle} />}
          </View>
          <Text style={styles.optionText}>{option.label === undefined ? option.namaLengkap + " ( "+ option.ponsel +" ) " : option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  radioGroup: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedOuterCircle: {
    borderColor: '#007BFF',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
  },
  optionText: {
    fontSize: 16,
  },
});

export default RadioButtonPenjualGroup;

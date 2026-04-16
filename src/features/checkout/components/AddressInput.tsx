import { View, Text, TextInput, StyleSheet } from 'react-native';

export const AddressInput = ({ value, onChange }: any) => {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>عنوان التوصيل</Text>

      <TextInput
        style={styles.input}
        placeholder="ادخل عنوانك"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },

  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 12,
    textAlign: 'right',
  },
});
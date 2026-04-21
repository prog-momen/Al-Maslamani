import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const PaymentMethod = ({ value, onChange }: any) => {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>طريقة الدفع</Text>

      <TouchableOpacity
        style={[styles.option, value === 'cash' && styles.active]}
        onPress={() => onChange('cash')}
      >
        <Text>الدفع عند الاستلام</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, value === 'card' && styles.active]}
        onPress={() => onChange('card')}
      >
        <Text>بطاقة بنكية</Text>
      </TouchableOpacity>
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

  option: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },

  active: {
    borderColor: '#84BD00',
    backgroundColor: '#EAF7E3',
  },
});
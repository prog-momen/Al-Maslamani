import { View, Text, StyleSheet } from 'react-native';

export const OrderSummary = ({
  subtotal,
  shipping,
  total,
}: any) => {
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={styles.label}>المجموع الفرعي</Text>
        <Text>{subtotal} ₪</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>الشحن</Text>
        <Text>{shipping === 0 ? 'مجاني' : `${shipping} ₪`}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>الإجمالي</Text>
        <Text style={styles.totalValue}>{total} ₪</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#F7F3EA',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },

  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },

  label: {
    color: '#666',
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
  },

  totalLabel: {
    fontWeight: 'bold',
  },

  totalValue: {
    fontWeight: 'bold',
  },
});
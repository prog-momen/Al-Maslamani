import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export const CheckoutSteps = () => {
  return (
    <View style={styles.container}>


      <View style={styles.row}>


        <View style={styles.stepContainer}>
          <View style={[styles.circle, styles.activeCircle]}>
            <Feather name="check" size={18} color="#fff" />
          </View>
          <Text style={styles.activeLabel}>السلة</Text>
        </View>

        <View style={styles.line} />


        <View style={styles.stepContainer}>
          <View style={styles.circle}>
            <Text style={styles.number}>2</Text>
          </View>
          <Text style={styles.label}>الدفع</Text>
        </View>

        <View style={styles.line} />


        <View style={styles.stepContainer}>
          <View style={styles.circle}>
            <Text style={styles.number}>3</Text>
          </View>
          <Text style={styles.label}>التأكيد</Text>
        </View>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  stepContainer: {
    alignItems: 'center',
  },

  circle: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#84BD00',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#84BD00',
  },

  activeCircle: {
    backgroundColor: '#84BD00',
  },

  number: {
    color: '#fff',
    fontWeight: 'bold',
  },

  line: {
    width: 40,
    height: 2,
    backgroundColor: '#84BD00',
    marginHorizontal: 8,
  },

  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#777',
  },

  activeLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#84BD00',
    fontWeight: 'bold',
  },
});
import { StyleSheet, Text, View } from 'react-native';

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FEF2F2',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  description: {
    fontSize: 14,
    color: '#B91C1C',
  },
});

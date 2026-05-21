import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jourture</Text>
      <Text style={styles.subtitle}>Your daily journey forward</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8
  }
})

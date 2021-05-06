import { Surface } from 'gl-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GradientPlane from './src/ui/GradientPlane';

export default function App() {
  return <Surface style={StyleSheet.absoluteFill}>
    <GradientPlane initialColors={{
      colorFront:'#f40',
      colorBack:'#820',
    }}/>
  </Surface>
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

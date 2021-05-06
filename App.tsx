import { Surface } from 'gl-react-native';
import React from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import GradientPlane, { getGradientTransition, SetGradient } from './src/ui/GradientPlane';

export default function App() {
  let setGradient = new SetGradient()
  return <View style={StyleSheet.absoluteFill}>
    <Surface style={StyleSheet.absoluteFill}>
      <GradientPlane
        colorInner={'#444'}
        colorOuter={'#222'}
        setGradient={setGradient}
      />
    </Surface>
    <SafeAreaView>
      <Button title={'change'} onPress={()=>{
        setGradient.setGradient(getGradientTransition('#f40', '#420'));
      }}/>
    </SafeAreaView>
  </View>
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

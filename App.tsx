import React, { ReactElement } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { interval } from 'rxjs';
import CountdownTimer from './src/CountdownTimer';
import { PomodoroState } from './src/PomodoroStateChangeInterface';
import PomodoroTimerViewController from './src/PomodoroTimerViewController';
import PomodoroTimerViewModel from './src/PomodoroTimerViewModel';
import ProfileStoreInterface from './src/ProfileStoreInterface';
import { StepsCarousel, StepsCarouselAdapter } from './src/ui/StepsCarousel';


export default function App(){
  const timer = new CountdownTimer();
  const store = new class implements ProfileStoreInterface{
    getStateDurationWork(): number {
      return 25000;
    }
    getStateDurationBreak(): number {
      return 5000;
    }
    getStateDurationRecess(): number {
      return 15000;
    }
    getStateIterationsBeforeRecess(): number {
      return 3;
    }
  }
  const viewModel = new PomodoroTimerViewModel(store, timer);

  let progress = 0;
  let position = 0;
  const steps = [
    PomodoroState.Work,
    PomodoroState.Break,
    PomodoroState.Work,
    PomodoroState.Recess,
  ];

  const getStateCurrent = ()=>{
    return viewModel.getStateTitle(steps[position % steps.length]);
  };

  const getStateFollowing = ()=>{
    return viewModel.getStateTitle(steps[(position + 1) % steps.length]);
  };

  let adapter = new StepsCarouselAdapter<string>();
  adapter.onCreateView = (key, width) => getItemView(key, width);
  adapter.onFetchKeyCurrent = () => getStateCurrent();
  adapter.onFetchKeyFollowing = () => getStateFollowing();
  adapter.onFetchProgress = () => progress;
  adapter.onUserMovedNext = (keySkipped, keySelected) => {
      position++;
      progress = 0;
      adapter.update();
  };

  // debug code
  interval(10).subscribe(() => {
    progress+=0.002;
    if(progress >= 1){
      progress = 0;
      position = ++position%4;
    }
    adapter.update();
  });

  return (
    <SafeAreaView style={[StyleSheet.absoluteFill, styles.root]}>
      {/* <PomodoroTimerViewController
        style={styles.timer}
        countdownTimer={viewModel}
        pomodoroState={viewModel}/> */}
      <StepsCarousel
        style={styles.carousel}
        adapter={adapter}
      />
    </SafeAreaView>
  );
}

function getItemView(title:string, width:number): ReactElement {
  return <View style={{
    justifyContent: 'center',
    height: '100%',
    width,
  }}>
    <Text style={{
      fontSize: 64,
      textAlign: 'center',
      color: '#fff',
    }}>{title}</Text>
  </View>
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#555',
    position:'relative',
  },
  carousel:{
    height:64,
    alignSelf:'flex-start'
  },
//   timer: {
//     zIndex: 1,
//     position:'absolute',
//     alignSelf:'center',
//   },
});

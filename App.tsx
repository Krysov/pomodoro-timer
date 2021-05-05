import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { color } from 'react-native-reanimated';
import { interval } from 'rxjs';
import CountdownTimer from './src/CountdownTimer';
import PomodoroTimerViewController from './src/PomodoroTimerViewController';
import PomodoroTimerViewModel from './src/PomodoroTimerViewModel';
import ProfileStoreInterface from './src/ProfileStoreInterface';
import { Carousel, CarouselAdapter } from './src/ui/StepsCarousel';


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
    {testID: 'step1', color:'#f0f'},
    {testID: 'step2', color:'#ff0'},
    {testID: 'step3', color:'#0ff'},
  ];

  const loopedSteps = [1, 2, 1, 3];
  let adapter = new CarouselAdapter<number>();
  adapter.onCreateView = (key, width) => {return <View
    testID={'step'+key}
    style={{backgroundColor:(key>0&&key<4)?steps[key-1].color:'#444', width}}
  />};
  adapter.onFetchKeyCurrent = () => loopedSteps[position%loopedSteps.length];
  adapter.onFetchKeyFollowing = () => loopedSteps[(position+1)%loopedSteps.length];
  adapter.onFetchProgress = () => progress;
  adapter.onUserMovedNext = (keySkipped, keySelected) => {
      position++;
      progress = 0;
      adapter.update();
  };

  // debug code
  interval(10).subscribe(() => {
    progress+=0.005;
    if(progress >= 1){
      progress = 0;
      position = ++position%4;
    }
    adapter.update();
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
        {/* <PomodoroTimerViewController
          style={styles.timer}
          countdownTimer={viewModel}
          pomodoroState={viewModel}/> */}
        <Carousel style={styles.stateStepper} adapter={adapter}/>
    </View>
  );
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
  timer: {
    zIndex: 1,
    position:'absolute',
    alignSelf:'center',
  },
  stateStepper:{
    height:96,
    width:360,

    position:'relative',
    // marginTop:24,
    // alignSelf:'flex-start',
  }
});

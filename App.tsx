import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { interval } from 'rxjs';
import CountdownTimer from './src/CountdownTimer';
import PomodoroTimerViewController from './src/PomodoroTimerViewController';
import PomodoroTimerViewModel from './src/PomodoroTimerViewModel';
import ProfileStoreInterface from './src/ProfileStoreInterface';
import StepsCarousel, { StepsCarouselAdapter } from './src/ui/StepsCarousel';


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
  let statesCarousel:StepsCarousel|undefined;
  let numSteps = 0
  const steps = [
    {testID: 'step1', color:'#f0f'},
    {testID: 'step2', color:'#ff0'},
    {testID: 'step3', color:'#0ff'},
  ];
  const stepsSequence = [steps[0], steps[1], steps[0], steps[2]];
  const stepsAdapter = new class implements StepsCarouselAdapter{
      getCurrentStepView(expectedWidth: number){ return this.getComponent(expectedWidth, this.getStep(numSteps)) }
      getNextStepView(expectedWidth: number){ return this.getComponent(expectedWidth, this.getStep(numSteps + 1)) }
      getStepProgress(){ return progress }
      private getStep(idx: number){ return stepsSequence[idx%stepsSequence.length] }
      private getComponent(width: number, data: any): ReactElement{
          return <View testID={data.testID} style={{backgroundColor:data.color, width}}/>
      }
  }

  // debug code
  interval(10).subscribe(() => {
    progress+=0.005
    if(progress >= 1){
      progress = 0
      numSteps = ++numSteps%4
      statesCarousel?.updateSteps()
    }
  })

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]}>
        {/* <PomodoroTimerViewController
          style={styles.timer}
          countdownTimer={viewModel}
          pomodoroState={viewModel}/> */}
        <StepsCarousel style={styles.stateStepper} adapter={stepsAdapter}/>
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

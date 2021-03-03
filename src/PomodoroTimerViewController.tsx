import React, {useState, useEffect} from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';
import { ViewProps } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler'
import CountdownTimerInterface from './CountdownTimerInterface';
import { MinutesSeconds } from './PomodoroTimerViewModel';
import PomodoroStateChangeInterface from './PomodoroStateChangeInterface';
import { merge } from "rxjs";
import CompletingCircle from './ui/CompletingCircle';

export interface PomodoroTimerViewProps {
  countdownTimer: CountdownTimerInterface<MinutesSeconds>;
  pomodoroState: PomodoroStateChangeInterface;
}
const PomodoroTimerViewController = (props:PomodoroTimerViewProps) => {
  const timer = props.countdownTimer;
  const [time, setTime] = useState(timer.getCurrentTime())
  const [isRunning, setIsRunning] = useState(timer.isTimerRunning())
  const runButtonSettings = timer.isTimerRunning()
    ? timerButtonSettingsPause
    : timerButtonSettingsStart;
  
  useEffect(() => {
    const subscription = merge(
      timer.onCountdownUpdate(),
      timer.onCountdownToggle(),
      timer.onCountdownFinish(),
    ).subscribe(_timer => {
      setTime(_timer.getCurrentTime())
      setIsRunning(timer.isTimerRunning())
    })
    return ()=> subscription.unsubscribe()
  }, [time, isRunning])

  return <View style={styles.root}>
    <View style={styles.timerContainer}>
        <View style={{
            flexDirection:'row', 
            position:'absolute', 
            alignSelf:'center',
            width:timerContainerSize,
            justifyContent:'center'
          }}>
          <Text testID='minutes_label' style={[styles.timerText, {textAlign:"right", marginRight:timerTextSpacing}]}>{time.partMinutes}</Text>
          <Text style={[styles.timerText, {marginBottom: 15}]}>:</Text>
          <Text testID='seconds_label' style={[styles.timerText, {textAlign:"left", marginLeft:timerTextSpacing}]}>{time.partSeconds}</Text>
        </View>
        <View style={[StyleSheet.absoluteFillObject,
          {justifyContent:'space-between', margin:timerButtonSpacing}]}>
          <TimerButton
            testID='reset_button'
            settings={timerButtonSettingsReset}
            timer={timer}
          />
          <TimerButton
            testID='run_button'
            settings={runButtonSettings}
            timer={timer}
          />
        </View>
    </View>
    <View style={{position:'absolute', alignSelf:'center'}}>
      <CompletingCircle
        completion={0.75}
        diameter={300}
        lineColor='#fff'
        lineWidth={15}
        strokeCap='round'
      />
    </View>
  </View>
};

interface TimerButtonSettings{
  readonly iconImageName : string
  readonly iconFittingFactor : number
  readonly onClick : (timer : CountdownTimerInterface<MinutesSeconds>) => void
}
const timerButtonSettingsStart = new class implements TimerButtonSettings {
  iconImageName = 'controller-play'
  iconFittingFactor = 2.0
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.startTimer()
}
const timerButtonSettingsPause = new class implements TimerButtonSettings {
  iconImageName = 'controller-paus'
  iconFittingFactor = 2.0
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.pauseTimer()
}
const timerButtonSettingsReset = new class implements TimerButtonSettings {
  iconImageName = 'ccw'
  iconFittingFactor = 1.8
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.resetTimer()
}
interface TimerButtonProps extends ViewProps{
  settings : TimerButtonSettings
  timer : CountdownTimerInterface<MinutesSeconds>
}
function TimerButton(props:TimerButtonProps){
  return <TouchableHighlight
    onPress = {() => props.settings.onClick(props.timer)}
    underlayColor = '#f42'
    style = {[{
      width: timerButtonSize,
      height: timerButtonSize,
      borderRadius: timerButtonSize / 2,
      backgroundColor: '#e20',
      justifyContent: "center",
      alignItems:'center',
      alignSelf:"center",
    }, props.style]}>
  </TouchableHighlight>
}

const timerButtonSize = 64
const timerTextSpacing = 16;
const timerButtonSpacing = 12;
const timerContainerSize = 256;
const styles = StyleSheet.create({
  root: {
    backgroundColor: '#333',
    justifyContent: 'center',
  },
  timerContainer: {
    width: timerContainerSize,
    height: timerContainerSize,
    borderRadius: timerContainerSize / 2,
    backgroundColor: '#fff',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position:'absolute',
  },
  timerText: {
    alignSelf: 'center',
    color: '#444',
    fontSize: 72
  },
});

export default PomodoroTimerViewController;
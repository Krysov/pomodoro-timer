import React, {useState, useEffect} from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import CountdownTimerInterface from './CountdownTimerInterface';
import { MinutesSeconds } from './PomodoroTimerViewModel';
import PomodoroStateChangeInterface from './PomodoroStateChangeInterface';
import { merge } from "rxjs";
import TimerButton, { TimerButtonSettings } from './ui/TimerButton';
import TimerClock from './ui/TimerClock';


export default function PomodoroTimerViewController(props:PomodoroTimerViewProps) {
  const timer = props.countdownTimer
  const [time, setTime] = useState(timer.getCurrentTime())
  const [isRunning, setIsRunning] = useState(timer.isTimerRunning())
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
  
  const runButtonSettings = timer.isTimerRunning()
  ? TimerButtonSettingsPause
  : TimerButtonSettingsStart

  return <View style={styles.root}>
    <TimerClock time={time}/>
    <View style={[StyleSheet.absoluteFillObject,
      {justifyContent:'space-between', margin:timerButtonSpacing}]}>
      <TimerButton
        testID='reset_button'
        timerButtonSize={timerButtonSize}
        settings={TimerButtonSettingsReset}
        timer={timer}
      />
      <TimerButton
        testID='run_button'
        timerButtonSize={timerButtonSize}
        settings={runButtonSettings}
        timer={timer}
      />
    </View>
  </View>
}

export interface PomodoroTimerViewProps {
  countdownTimer: CountdownTimerInterface<MinutesSeconds>;
  pomodoroState: PomodoroStateChangeInterface;
}

export const TimerButtonSettingsStart = new class implements TimerButtonSettings {
  iconName = '►'
  iconSize = 32
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.startTimer()
}
export const TimerButtonSettingsPause = new class implements TimerButtonSettings {
  iconName = '▐ ▌'
  iconSize = 16
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.pauseTimer()
}
export const TimerButtonSettingsReset = new class implements TimerButtonSettings {
  iconName = '⟲'
  iconSize = 32
  onClick = (timer : CountdownTimerInterface<MinutesSeconds>) => timer.resetTimer()
}

const timerButtonSize = 64
const timerButtonSpacing = 12
const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
  },
  timerText: {
    alignSelf: 'center',
    color: '#444',
    fontSize: 72
  },
})

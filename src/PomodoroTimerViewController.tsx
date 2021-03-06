import React, {useState, useEffect} from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import Timer from './Timer.interface';
import PomodoroStateChangeInterface from './PomodoroStateChangeInterface';
import { merge } from "rxjs";
import TimerButton from './ui/TimerButton';
import TimerClock from './ui/TimerClock';
import { MinutesSeconds } from './TimeFormats';


export default function PomodoroTimerViewController(props:PomodoroTimerViewProps) {
  const timer = props.countdownTimer
  const [time, setTime] = useState(timer.getCurrentTime())
  const [isRunning, setIsRunning] = useState(timer.isTimerRunning())
  useEffect(() => {
    const subscription = merge(
      timer.onTimerUpdate(),
      timer.onTimerToggle(),
      timer.onTimerFinish(),
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
        iconName={TimerButtonSettingsReset.iconName}
        iconSize={TimerButtonSettingsReset.iconSize}
        onClick={()=>TimerButtonSettingsReset.onClick(timer)}
      />
      <TimerButton
        testID='run_button'
        timerButtonSize={timerButtonSize}
        iconName={runButtonSettings.iconName}
        iconSize={runButtonSettings.iconSize}
        onClick={()=>runButtonSettings.onClick(timer)}
      />
    </View>
  </View>
}

export interface PomodoroTimerViewProps {
  countdownTimer: Timer<MinutesSeconds>;
  pomodoroState: PomodoroStateChangeInterface;
}

interface TimerButtonSettings{
  readonly iconName: string
  readonly iconSize: number
  readonly onClick: (timer: Timer<MinutesSeconds>) => void
}
export const TimerButtonSettingsStart = new class implements TimerButtonSettings {
  iconName = '►'
  iconSize = 32
  onClick = (timer : Timer<MinutesSeconds>) => timer.startTimer()
}
export const TimerButtonSettingsPause = new class implements TimerButtonSettings {
  iconName = '▐ ▌'
  iconSize = 16
  onClick = (timer : Timer<MinutesSeconds>) => timer.pauseTimer()
}
export const TimerButtonSettingsReset = new class implements TimerButtonSettings {
  iconName = '⟲'
  iconSize = 32
  onClick = (timer : Timer<MinutesSeconds>) => timer.resetTimer()
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

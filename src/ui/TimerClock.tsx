import React from 'react';
import { View, Text, StyleSheet } from "react-native"
import { MinutesSeconds } from '../TimeFormats';
// import CompletingCircle from './CompletingCircle';

export default function TimerClock(props:TimerClockProps){
    const time = props.time
    return <View testID='countdown_clock'
        style={styles.timerContainer}>
        <Text style={[styles.timerText, {transform:[{translateY:-6}], position:'absolute'}]}>
            :
        </Text>
        <View style={[StyleSheet.absoluteFillObject, {flexDirection:'row', justifyContent:'center', alignItems:'center'}]}>
            <Text testID='minutes_label' 
                style={[styles.timerText, {textAlign:"right", marginRight:timerTextSpacing}]}>
                    {time.partMinutes}
            </Text>
            
            <Text testID='seconds_label'
                style={[styles.timerText, {textAlign:"left", marginLeft:timerTextSpacing}]}>
                    {time.partSeconds}
            </Text>
        </View>
        {/* <View style={{position:'absolute', alignSelf:'center'}}>
        <CompletingCircle
            completion={0.75}
            diameter={300}
            lineColor='#fff'
            lineWidth={15}
            strokeCap='round'
        />
        </View> */}
    </View>
}
export interface TimerClockProps{
    time: MinutesSeconds
}

const timerTextSpacing = 16;
const timerContainerSize = 256;
const styles = StyleSheet.create({
  timerContainer: {
    width: timerContainerSize,
    height: timerContainerSize,
    borderRadius: timerContainerSize / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection:'row',
    justifyContent:'center',
  },
  timerText: {
    alignSelf: 'center',
    color: '#444',
    fontSize: 72
  },
});
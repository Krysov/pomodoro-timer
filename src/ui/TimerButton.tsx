import React from 'react';
import { ViewProps } from "react-native";
import CountdownTimerInterface from "../CountdownTimerInterface";
import { MinutesSeconds } from "../PomodoroTimerViewModel";
import { TouchableHighlight } from "react-native-gesture-handler";
import Icon from "./Icon";


export default function TimerButton(props:TimerButtonProps){
    const timerButtonSize = props.timerButtonSize
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
        <Icon
            name={props.settings.iconName}
            size={props.settings.iconSize}
            style = {{
                width: timerButtonSize,
                height: timerButtonSize,
            }}
        />
    </TouchableHighlight>
}

export interface TimerButtonProps extends ViewProps{
    settings: TimerButtonSettings
    timer: CountdownTimerInterface<MinutesSeconds>
    timerButtonSize: number
}

export interface TimerButtonSettings{
    readonly iconName: string
    readonly iconSize: number
    readonly onClick: (timer: CountdownTimerInterface<MinutesSeconds>) => void
}

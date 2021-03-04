import React from 'react';
import { ViewProps } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Icon from "./Icon";


export default function TimerButton(props:TimerButtonProps){
    const timerButtonSize = props.timerButtonSize
    return <TouchableHighlight
        onPress = {() => props.onClick()}
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
            name={props.iconName}
            size={props.iconSize}
            style = {{
                width: timerButtonSize,
                height: timerButtonSize,
            }}
        />
    </TouchableHighlight>
}

export interface TimerButtonProps extends ViewProps{
    readonly iconName: string
    readonly iconSize: number
    onClick: ()=>void
    timerButtonSize: number
}

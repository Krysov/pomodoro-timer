import React from 'react';
import { Text, View, FlexStyle, StyleSheet } from 'react-native';

export default function Icon(props: IconProps) {
    return <View style={[props.style]}>
        <Text style={[StyleSheet.absoluteFillObject, {
            color:'#fff',
            fontSize:props.size,
            textAlign:'center',
            textAlignVertical:'center'
        }]}>{props.name}</Text>
    </View>
}

export interface IconProps {
    name: string
    size: number
    style: FlexStyle
}
import React from 'react';
import {
    Surface,
    Shape,
    Group,
  } from '@react-native-community/art';

interface CompletingCircleProps{
    completion: number;
    diameter: number;
    lineColor?: string;
    lineWidth?: number;
    strokeCap?: 'butt' | 'square' | 'round'; 
}

class CompletingCircle extends React.Component<CompletingCircleProps>{
    render(){
        const pi = Math.PI;
        const comp = Math.max(0, Math.min(0.99999, this.props.completion)) -0.5;
        const strokeWidth = this.props.lineWidth !== undefined ? this.props.lineWidth : 5;
        const x1 = 0;
        const y1 = 0;
        const r = this.props.diameter / 2;
        const x2 = Math.sin(comp*pi*2.0)*-r;
        const y2 = Math.cos(comp*pi*2.0)*r+r;
        const invert = 1;
        let largeFlag = (comp > 0 ? 0 : 1);
        largeFlag = invert > 0 ? 1-largeFlag : largeFlag;
        const path = 'M '+x1+' '+y1+' a'+r+' '+r+' 0 '+largeFlag+' '+invert+' '+x2+' '+y2
        const cap = this.props.strokeCap !== undefined ? this.props.strokeCap : 'butt';
        const stroke = this.props.lineColor !== undefined ? this.props.lineColor : '#000';
        return(
            <Surface width={this.props.diameter+strokeWidth} height={this.props.diameter+strokeWidth}>
                <Group x={(this.props.diameter+strokeWidth)/2} y={strokeWidth/2} >
                <Shape
                    d={path}
                    stroke={stroke}
                    strokeCap={cap}
                    strokeWidth={strokeWidth}
                />
                </Group>
            </Surface>
        );
    }
}

export default CompletingCircle;
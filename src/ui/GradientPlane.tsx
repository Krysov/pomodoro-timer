import React, { useLayoutEffect, useRef, useState } from 'react';
import { ColorValue, StyleSheet } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-native";
import { parseToRgba } from 'color2k';
import { Milliseconds } from '../TimeFormats';

export default function GradientPlane(props: RadialGradientProps){
    useRef
    const [colors, setColors] = useState(props.initialColors);
    const [gradientDimen, setGradientDimen] = useState([0.5, -0.4, 1.8]);
    // useLayoutEffect
    return <Surface style={StyleSheet.absoluteFill}>
        <Node
            shader={shaders.radialGradient}
            uniforms={{
                gColFront: toRGB(colors.colorFront),
                gColBack: toRGB(colors.colorBack),
                gPosRad: gradientDimen,
                noiseMap: {uri:'https://i.stack.imgur.com/plUPA.jpg'}
        }}/>
    </Surface>
}

export type RadialGradientProps = {
    initialColors: RadialGradientColors;
    startupAnimationFromColors?: RadialGradientColors;
    gradientGrainMapUri?: string;
    colorsTransitionAnimationDuration?: Milliseconds;
}

export interface RadialGradientColors{
    readonly colorFront: ColorValue;
    readonly colorBack: ColorValue;
}

class RadialGradientPosition{
    constructor(){

    }
}

export function lerp(colorA: RadialGradientColors, colorB: RadialGradientColors){

}

function toRGB(color: ColorValue): [number,number,number]{
    var rgbTall = parseToRgba(color as string);
    return [rgbTall[0]/255., rgbTall[1]/255., rgbTall[2]/255.];
}

const glslFragmentShader = GLSL`
precision lowp float;
varying vec2 uv;

uniform sampler2D noiseMap;

// radial gradient colors
uniform vec3 gColFront;
uniform vec3 gColBack;

// x,y gradient center position
// z gradient radius
uniform vec3 gPosRad;

void main()
{
    float blend = clamp(distance(uv, gPosRad.xy) / gPosRad.z, 0., 1.);
    blend += texture2D(noiseMap, uv).x*0.1-0.05;
    gl_FragColor = vec4(mix(gColFront, gColBack, blend), 1.);
}
`;

const shaders = Shaders.create({
    radialGradient: {
      frag: glslFragmentShader
    }
});
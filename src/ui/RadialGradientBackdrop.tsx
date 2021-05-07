import React, { useEffect, useState } from 'react';
import { ColorValue, ViewProps, View, Image } from "react-native";
import { Shaders, Node, GLSL } from "gl-react";
import { parseToRgba } from 'color2k';
import { Milliseconds } from '../TimeFormats';
import noiseMap from '../../app/assets/noise_map.jpg'

export default function RadialGradientBackdrop(props: GradientBackdrop.BackdropProps){
    const [values, setValues] = useState(getGradientValues(
        ...toRGB(props.colorInner),
        ...toRGB(props.colorOuter),
    ));
    const [transition, setTransition] = useState(
        GradientBackdrop.getGradientTransition(props.colorInner, props.colorOuter)
    );
    const [dimen, setDimen] = useState({width:1, height:1});
    const [animation, setAnimation] = useState(1);
    useEffect(()=>{
        setValues(getGradientValues(
            ...toRGB(transition.targetColorInner),
            ...toRGB(transition.targetColorOuter),
        ));
        // todo: trigger animation
    }, [transition]);
    useEffect(()=>{
    }, [values, animation]);

    if(props.setGradient){
        props.setGradient.setGradient = gradient => {setTransition(gradient)}
        props.setGradient.getGradient = () => { return {
            colorInner:toHex([
                values.colorInnerR,
                values.colorInnerG,
                values.colorInnerB,
            ]),
            colorOuter:toHex([
                values.colorOuterR,
                values.colorOuterG,
                values.colorOuterB,
            ]),
        }}
    }
    return <View onLayout={e => {setDimen(e.nativeEvent.layout)}}>
        <Node
            shader={shaders.radialGradient}
            uniforms={{
                gColInner: [values.colorInnerR, values.colorInnerG, values.colorInnerB],
                gColOuter: [values.colorOuterR, values.colorOuterG, values.colorOuterB],
                gPosRad: [values.gradientPosX, values.gradientPosY, values.gradientRadius],
                noiseMap: {uri:Image.resolveAssetSource(noiseMap)}
        }}/>
    </View>
}

export namespace GradientBackdrop{
    export function getGradientTransition(
        targetColorInner: ColorValue, targetColorOuter: ColorValue,
        transitionType: GradientTransitionType = GradientTransitionType.Instant,
        transitionDuration: Milliseconds = DefaultTransitionDuration,
        ){
        return {
            targetColorInner,
            targetColorOuter,
            transitionType,
            transitionDuration,
        } as GradientTransition;
    }

    export interface GradientTransition{
        targetColorInner: ColorValue;
        targetColorOuter: ColorValue;
        transitionType?: GradientTransitionType;
        transitionDuration?: Milliseconds;
    }

    export enum GradientTransitionType{
        Instant,
        DirectFade,
        OutInSwap,
    }

    export interface BackdropProps extends ViewProps {
        readonly colorInner: ColorValue;
        readonly colorOuter: ColorValue;
        readonly setGradient?: BackdropRemote;
    }

    export class BackdropRemote{
        setGradient(gradient:GradientTransition){
            throw Error('The instance must be passed to a GradientPlane before use!');
        }
        getGradient():{colorInner:number[], colorOuter:number[]}{
            throw Error('The instance must be passed to a GradientPlane before use!');
        }
    }
}

function getGradientValues(
    colorInnerR: number,
    colorInnerG: number,
    colorInnerB: number,
    colorOuterR: number,
    colorOuterG: number,
    colorOuterB: number,
    gradientPosX: number = DefaultGradientPosX,
    gradientPosY: number = DefaultGradientPosY,
    gradientRadius: number = DefaultGradientRadius,
    ){
    return {
        colorInnerR,
        colorInnerG,
        colorInnerB,
        colorOuterR,
        colorOuterG,
        colorOuterB,
        gradientPosX,
        gradientPosY,
        gradientRadius,
    }
}

function lerp(a: typeof getGradientValues, b: typeof getGradientValues){
    // todo: impl
}

function toRGB(color: ColorValue): [number,number,number]{
    let rgb = parseToRgba(color as string);
    return [rgb[0]/255., rgb[1]/255., rgb[2]/255.];
}

function toHex(color: [number,number,number]): number[] {
    return color.map(channel => Math.trunc(channel * 255.));
}

const glslFragmentShader = GLSL`
precision lowp float;
varying vec2 uv;

uniform sampler2D noiseMap;

// radial gradient colors
uniform vec3 gColInner;
uniform vec3 gColOuter;

// x,y gradient center position
// z gradient radius
uniform vec3 gPosRad;

void main()
{
    float blend = clamp(distance(uv, gPosRad.xy) / gPosRad.z, 0., 1.);
    blend += texture2D(noiseMap, uv).x*0.1-0.05;
    gl_FragColor = vec4(mix(gColInner, gColOuter, blend), 1.);
}
`;

const shaders = Shaders.create({
    radialGradient: {
      frag: glslFragmentShader
    }
});

const DefaultTransitionDuration: Milliseconds = 333;
const DefaultGradientPosX = 0.5;
const DefaultGradientPosY = -0.4;
const LoweredGradientPosY = -0.6;
const DefaultGradientRadius = 1.8;
const LoweredGradientRadius = 0.8;

import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import JestUnitHandler from '../utils/TestingUtils';
import RadialGradientBackdrop, { GradientBackdrop } from "./RadialGradientBackdrop";
import { Milliseconds } from '../TimeFormats';
import { act } from 'react-test-renderer';


describe('GradientPlane', ()=>{

    const jestHandler = new JestUnitHandler(true);
    const animationDuration: Milliseconds = 1000;

    beforeEach(async ()=>{
        jestHandler.beginUnitTest();
    });
    
    afterEach(async ()=>{
        jestHandler.finishUnitTest();
        cleanup();
    });

    it('test gradient transition', async ()=>{
        const initialColors = GradientBackdrop.getGradientTransition('#f00', '#800');
        const nextColors = GradientBackdrop.getGradientTransition('#00f', '#008');
        let setGradient = new GradientBackdrop.BackdropRemote()
        const vc = <RadialGradientBackdrop
            colorInner={'#444'}
            colorOuter={'#000'}
            setGradient={setGradient}
        />;
        render(vc);
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0x44, 0x44, 0x44],
            colorOuter:[0x00, 0x00, 0x00],
        });
        
        act(()=>setGradient.setGradient(GradientBackdrop.getGradientTransition('#ff0', '#440',
            GradientBackdrop.GradientTransitionType.Instant, 0)));
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0xff, 0xff, 0x00],
            colorOuter:[0x44, 0x44, 0x00],
        });

        act(()=>setGradient.setGradient(GradientBackdrop.getGradientTransition('#0ff', '#044',
            GradientBackdrop.GradientTransitionType.DirectFade, animationDuration)));
        await jestHandler.delay(animationDuration/2);
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0x88, 0xff, 0x88],
            colorOuter:[0x22, 0x44, 0x22],
        });
        await jestHandler.delay(animationDuration/2);
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0x00, 0xff, 0xff],
            colorOuter:[0x00, 0x44, 0x44],
        });
        
        act(()=>setGradient.setGradient(GradientBackdrop.getGradientTransition('#ff0', '#440',
            GradientBackdrop.GradientTransitionType.OutInSwap, animationDuration)));
        await jestHandler.delay(animationDuration/2);
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0x88, 0xff, 0x88],
            colorOuter:[0x22, 0x44, 0x22],
        });
        await jestHandler.delay(animationDuration/2);
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0x00, 0xff, 0xff],
            colorOuter:[0x00, 0x44, 0x44],
        });
    });

    function parseToHexArray(input:Array<number>){
        input.map(n => Math.trunc(n * 255.));
    }
});

import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import RadialGradientBackdrop, { GradientBackdrop } from "./RadialGradientBackdrop";
import { act } from 'react-test-renderer';


describe('GradientPlane', ()=>{
    
    afterEach(async ()=>{
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
        
        act(()=>setGradient.setGradient(GradientBackdrop.getGradientTransition('#ff0', '#440')));
        expect(setGradient.getGradient()).toStrictEqual({
            colorInner:[0xff, 0xff, 0x00],
            colorOuter:[0x44, 0x44, 0x00],
        });
    });

});

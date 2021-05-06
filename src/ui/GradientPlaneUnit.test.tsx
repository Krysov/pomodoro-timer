import React from 'react';
import { render, cleanup } from '@testing-library/react-native';
import JestUnitHandler from '../utils/TestingUtils';
import GradientPlane, {RadialGradientColors} from "./GradientPlane";
import { Milliseconds } from '../TimeFormats';
import { Surface } from '../../__mocks__/GLReact.mocks';
// import { GLView } from '../../__mocks__/GLView.mocks';




describe('GradientPlane', ()=>{

    const jestHandler = new JestUnitHandler(true);
    const animationDuration: Milliseconds = 1000;

    beforeAll(async ()=>{
        // jest.mock('expo-gl', () => 'GLView');
        // jest.mock('expo-gl', () => 'NativeView');
        // jest.mock('gl-react', () => 'Node');
        // jest.mock('gl-react', () => 'Shaders');
        // jest.mock('gl-react', () => 'GLSL');
        // jest.mock('gl-react-native', () => 'Surface');
        // GLView
        // Surface
    })

    beforeEach(async ()=>{
        jestHandler.beginUnitTest();
    });
    
    afterEach(async ()=>{
        jestHandler.finishUnitTest();
        cleanup();
    });

    it('set colors', async ()=>{
        const startupColors: RadialGradientColors = {colorFront:'#444', colorBack:'#000'};
        const initialColors: RadialGradientColors = {colorFront:'#f00', colorBack:'#800'};
        const nextColors: RadialGradientColors = {colorFront:'#00f', colorBack:'#008'};
        const vc = <GradientPlane
            startupAnimationFromColors={startupColors}
            initialColors={initialColors}
            colorsTransitionAnimationDuration={animationDuration}
        />;
        const ren = render(vc);
        const root = ren.container;
        expect(root.instance.state.colors).toBe(startupColors);
        await jestHandler.delay(animationDuration);
        expect(root.instance.state.colors).toBe(initialColors);
        root.instance.setColors(nextColors);
        await jestHandler.delay(animationDuration/2);
        expect(root.instance.state.colors).toBe({colorFront:'#808', colorBack:'#404'});
        await jestHandler.delay(animationDuration/2);
        expect(root.instance.state.colors).toBe(nextColors);
    });
});

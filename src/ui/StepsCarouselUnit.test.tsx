import React, { ReactElement } from 'react';
import { View } from 'react-native';
// import { cleanup, render } from '@testing-library/react-native';
import TestRenderer from 'react-test-renderer';
import StepsCarousel, { StepsCarouselAdapter, CarouselState } from './StepsCarousel';
// import ViewShot, { captureRef, releaseCapture } from "react-native-view-shot";
// import chalk from 'chalk';

describe('StepsCarousel', ()=>{

    // afterEach(() => cleanup())
    
    it('test simple flow', async ()=>{
        let numSteps = 0
        let progress = 0
        const width = 256;
        const height = 128;
        let carousel: StepsCarousel
        const onTriggerNext = jest.fn()
        const steps = [
            {testID: 'step1', color:'#f0f'},
            {testID: 'step2', color:'#ff0'},
            {testID: 'step3', color:'#0ff'},
        ];
        const stepsSequence = [steps[0], steps[1], steps[0], steps[2]];
        const stepsAdapter = new class implements StepsCarouselAdapter{
            getCurrentStepView(expectedWidth: number){ return this.getComponent(expectedWidth, this.getStep(numSteps)) }
            getNextStepView(expectedWidth: number){ return this.getComponent(expectedWidth, this.getStep(numSteps + 1)) }
            getStepProgress(){ return progress }
            private getStep(idx: number){ return stepsSequence[idx%stepsSequence.length] }
            private getComponent(width: number, data: any): ReactElement{
                return <View testID={data.testID} style={{backgroundColor:data.color, width}}/>
            }
        }
        let onCapture = async (uri: string) => {
            console.log(uri);
            let result = await fetch(uri);
            console.log(result);
            console.log(await result.blob());
            releaseCapture(uri);
        }
        let onRef = async (ref: StepsCarousel) => {
            carousel = ref;
            // const result = await captureRef(carousel, {
            //     captureMode: 'mount',
            //     onCapture: onCapture,
            //     // onCaptureFailure:(e) => console.log(e),
            //     options:{format:'raw', width:16, height: 8, result: 'raw'}
            // });
            await captureRef(carousel, {
                format: "jpg",
                quality: 0.8
            }).then(
                uri => console.log("Image saved to", uri),
                error => console.error("Oops, snapshot failed", error)
            );
        }
        // const ren = await render(<ViewShot
        //     style={{width, height}}
        //     captureMode='mount'
        //     onCapture={onCapture}
        //     onCaptureFailure={e => console.log(e)}
        //     options={{format:'raw', width:16, height: 8, result: 'data-uri'}}>
        //     <StepsCarousel
        //         style={{width, height}}
        //         adapter={stepsAdapter}
        //         ref={ref => carousel = ref}
        //         onTriggeredNextStep={onTriggerNext}/>
        // </ViewShot>);
        // const ren = await render(<StepsCarousel
        //     style={{width, height}}
        //     adapter={stepsAdapter}
        //     ref={onRef}
        //     onTriggeredNextStep={onTriggerNext}/>
        // );

        await TestRenderer.create(<StepsCarousel
            style={{width, height}}
            adapter={stepsAdapter}
            ref={onRef}
            onTriggeredNextStep={onTriggerNext}/>);

        const setCarouselState = (carousel! as any).setCarouselState = jest.fn(
            (state: CarouselState) => (carousel! as any).setCarouselState(state));
        expect(setCarouselState).toBeCalledTimes(0);

        function getPixelChar(r: number, g: number, b: number, a: number): string {
            a = Math.min(255, Math.max(0, a));
            const charSet = ':░▒▓█';
            const char = charSet[Math.round(a/64.)];
            return chalk.rgb(
                Math.min(255, Math.max(0, r)),
                Math.min(255, Math.max(0, g)),
                Math.min(255, Math.max(0, b)))
                .visible(charSet[Math.round(a/64.)]);
        }

        let toLog = '';
        for(let y = 0; y <= 16; y++){
            if(y>0) toLog += '\n';
            for(let x = 0; x <= 16; x++){
                for(let z = 0; z < 2; z++){
                    toLog += getPixelChar(x*16, 127, y*16, y*16);
                }
                // toLog += ' '
            }
        }
        console.log(toLog);


        const a = 0xff;
        await new Promise(r => setTimeout(r, 4500));
        expect(setCarouselState).toHaveBeenLastCalledWith(CarouselState.isGoing);
        


        // carousel!.setStepProgress(0);
        
        
        
        
        


    })
})
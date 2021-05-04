import React, { ReactElement, useRef } from 'react';
import { View } from 'react-native';
import TestRenderer from 'react-test-renderer';
// import StepsCarousel, { StepsCarouselAdapter, CarouselState } from './StepsCarousel';

describe('StepsCarousel', ()=>{

    let step1 = <View testID={'idStep1'}/>;
    let step2 = <View testID={'idStep2'}/>;
    let step3 = <View testID={'idStep3'}/>;

    it('test steps adapter', async ()=>{
        var progress = 0;
        var position = 0;
        let adapter = new Adapter<string>();
        adapter.onCreateView = key => getStepViewFor(key);
        adapter.onFetchKeyCurrent = () => getStepKeyAt(position);
        adapter.onFetchKeyFollowing = () => getStepKeyAt(position + 1);
        adapter.onFetchProgress = () => progress;

        adapter.update();
        expect((adapter as any).getKeyCurrent()).toBe('keyStep1');
        expect((adapter as any).getKeyFollowing()).toBe('keyStep2');
        expect((adapter as any).getViewCurrent()).toBe(step1);
        expect((adapter as any).getViewFollowing()).toBe(step2);
        expect(Math.trunc((adapter as any).getStepProgress())*10).toBe(0);

        position = 3;
        progress = 0.5;
        adapter.update();
        expect((adapter as any).getKeyCurrent()).toBe('keyStep3');
        expect((adapter as any).getKeyFollowing()).toBe('keyStep1');
        expect((adapter as any).getViewCurrent()).toBe(step3);
        expect((adapter as any).getViewFollowing()).toBe(step1);
        expect(Math.trunc((adapter as any).getStepProgress())*10).toBe(5);

        const onTriggerNext = jest.fn((skipped, selected:string)=>{
            expect(skipped).toBe(getStepKeyAt(position));
            expect(selected).toBe(getStepKeyAt(position + 1));
            position++;
            progress = 0;
            adapter.update();
        })
        adapter.onUserMovedNext = (keySkipped, keySelected) => onTriggerNext;
        adapter.update = jest.fn(() => adapter.update());

        // todo: trigger and await onUserMovedNext
        expect(onTriggerNext).toBeCalledTimes(1);
        expect(adapter.update).toBeCalledTimes(1);
        expect((adapter as any).getKeyCurrent()).toBe('keyStep1');
        expect((adapter as any).getKeyFollowing()).toBe('keyStep2');
        expect(Math.trunc((adapter as any).getStepProgress())*10).toBe(0);
    });

    it('test carousel view', async ()=>{
        const width = 300;
        const height = 100;
        var progress = 0;
        var position = 0;
        let adapter = new Adapter<string>();
        adapter.onCreateView = key => getStepViewFor(key);
        adapter.onFetchKeyCurrent = () => getStepKeyAt(position);
        adapter.onFetchKeyFollowing = () => getStepKeyAt(position + 1);
        adapter.onFetchProgress = () => progress;
        adapter.onUserMovedNext = (keySkipped, keySelected) => {
            position++;
            progress = 0;
            adapter.update();
        };
        let carousel = useRef();
        let ren = await TestRenderer.create(<Carousel
            style={{width, height}}
            adapter={adapter}
            ref={carousel}
        />);

        expect(ren.root.findAllByProps({'testID': 'idStep1'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep2'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep3'})).toBeNull();

        position = 2;
        adapter.update();
        expect(ren.root.findAllByProps({'testID': 'idStep1'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep2'})).toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep3'})).not.toBeNull();

        position = 3;
        adapter.update();
        // todo: send event user begin drag
        // todo: send event user move left
        // todo: send event user stops drag
        expect(ren.root.findAllByProps({'testID': 'idStep1'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep2'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep3'})).toBeNull();

        jest.useFakeTimers();
        position = 3;
        adapter.update();
        // todo: send event user begin drag
        position = 0;
        adapter.update();
        expect(ren.root.findAllByProps({'testID': 'idStep1'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep2'})).toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep3'})).not.toBeNull();
        await jest.advanceTimersByTime(1000);
        expect(ren.root.findAllByProps({'testID': 'idStep1'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep2'})).not.toBeNull();
        expect(ren.root.findAllByProps({'testID': 'idStep3'})).toBeNull();
        jest.useRealTimers();
    });

    function getStepKeyAt(i:number): string {
        let loopedSequence = [
            'keyStep1',
            'keyStep2',
            'keyStep1',
            'keyStep3',
        ];
        return loopedSequence[i % loopedSequence.length];
    }

    function getStepViewFor(key: string): ReactElement{
        let map = new Map<string, ReactElement>([
            ['keyStep1', step1],
            ['keyStep2', step2],
            ['keyStep3', step3],
        ])
        return map.get(key)!;
    }

});
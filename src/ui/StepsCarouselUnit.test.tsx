import React, { ReactElement } from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { act, ReactTestInstance } from "react-test-renderer";
import { findAnyByProps } from '../utils/TestingUtils';
import { Carousel, CarouselAdapter } from './StepsCarousel';


describe('StepsCarousel', ()=>{

    let step1 = <View testID={'idStep1'}/>;
    let step2 = <View testID={'idStep2'}/>;
    let step3 = <View testID={'idStep3'}/>;

    it('test steps adapter', async ()=>{
        var progress = 0;
        var position = 0;
        let adapter = new CarouselAdapter<string>();
        adapter.onCreateView = key => getStepViewFor(key);
        adapter.onFetchKeyCurrent = () => getStepKeyAt(position);
        adapter.onFetchKeyFollowing = () => getStepKeyAt(position + 1);
        adapter.onFetchProgress = () => progress;

        adapter.update();
        expect(adapter.onFetchKeyCurrent()).toBe('keyStep1');
        expect(adapter.onFetchKeyFollowing()).toBe('keyStep2');
        expect((adapter as any).getViewCurrent()).toBe(step1);
        expect((adapter as any).getViewFollowing()).toBe(step2);
        expect(Math.trunc(adapter.onFetchProgress()*10)).toBe(0);

        position = 3;
        progress = 0.5;
        adapter.update();
        expect(adapter.onFetchKeyCurrent()).toBe('keyStep3');
        expect(adapter.onFetchKeyFollowing()).toBe('keyStep1');
        expect((adapter as any).getViewCurrent()).toBe(step3);
        expect((adapter as any).getViewFollowing()).toBe(step1);
        expect(Math.trunc(adapter.onFetchProgress()*10)).toBe(5);

        adapter.update = jest.fn(adapter.update);
        const onTriggerNext = jest.fn((skipped:string, selected:string)=>{
            expect(skipped).toBe(getStepKeyAt(position));
            expect(selected).toBe(getStepKeyAt(position + 1));
            position++;
            progress = 0;
            adapter.update();
        })
        adapter.onUserMovedNext = onTriggerNext;

        adapter.onUserMovedNext('keyStep3', 'keyStep1');
        expect(onTriggerNext).toBeCalledTimes(1);
        expect(adapter.update).toBeCalledTimes(1);
        expect(adapter.onFetchKeyCurrent()).toBe('keyStep1');
        expect(adapter.onFetchKeyFollowing()).toBe('keyStep2');
        expect((adapter as any).getViewCurrent()).toBe(step1);
        expect((adapter as any).getViewFollowing()).toBe(step2);
        expect(Math.trunc(adapter.onFetchProgress()*10)).toBe(0);
    });

    it('test carousel view', async ()=>{
        const width = 300;
        const height = 100;
        var progress = 0;
        var position = 0;
        let adapter = new CarouselAdapter<string>();
        adapter.onCreateView = key => getStepViewFor(key);
        adapter.onFetchKeyCurrent = () => getStepKeyAt(position);
        adapter.onFetchKeyFollowing = () => getStepKeyAt(position + 1);
        adapter.onFetchProgress = () => progress;
        adapter.onUserMovedNext = (keySkipped, keySelected) => {
            position++;
            progress = 0;
            adapter.update();
        };

        let ren = render(<Carousel
            style={{width, height}}
            adapter={adapter}
        />);
        let carousel = ren.getByTestId('idCarousellScroll')

        expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep2'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep3'})).toBeNull();

        position = 2;
        await act(async () => adapter.update());
        expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep2'})).toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep3'})).not.toBeNull();

        position = 3;
        await act(async () => adapter.update());
        scroll(carousel, 10);
        expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep2'})).toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep3'})).not.toBeNull();
        scroll(carousel, width);
        expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep2'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep3'})).toBeNull();

        jest.useFakeTimers();
        position = 3;
        await act(async () => adapter.update());
        fireEvent(carousel, 'onScrollBeginDrag', {});
        position = 0;
        await act(async () => adapter.update());

        // skip animation test
        // expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        // expect(findAnyByProps(carousel, {'testID': 'idStep2'})).toBeNull();
        // expect(findAnyByProps(carousel, {'testID': 'idStep3'})).not.toBeNull();
        // await jest.advanceTimersByTime(1000);

        expect(findAnyByProps(carousel, {'testID': 'idStep1'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep2'})).not.toBeNull();
        expect(findAnyByProps(carousel, {'testID': 'idStep3'})).toBeNull();
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

    function scroll(instance: ReactTestInstance, byX:number){
        const eventData = {
            nativeEvent: {
              contentOffset: {
                x: byX,
              },
            },
        };
        fireEvent(instance, 'onScrollBeginDrag', {});
        fireEvent(instance, 'onScrollEndDrag', eventData);
    }

});
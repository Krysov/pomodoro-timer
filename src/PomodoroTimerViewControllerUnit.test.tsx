import React from "react";
import PomodoroTimerViewController from './PomodoroTimerViewController'
import PomodoroStateChangeInterface, { PomodoroState } from './PomodoroStateChangeInterface'
import CountdownTimerInterface from './CountdownTimerInterface'
import { MinutesSeconds } from "./PomodoroTimerViewModel"
import { shallow, mount } from 'enzyme';
import { Observable, Subject } from "rxjs";

describe('PomodoroTimerView', () => {

    it('test run toggle', () => {
        const stateObject = new class implements PomodoroStateChangeInterface{
            onPomodoroStateChange(): Observable<PomodoroStateChangeInterface> {
                throw new Error("Method not implemented.");}
            getPomodoroState(): PomodoroState {
                throw new Error("Method not implemented.");}
            skipPomodoroState(): void {
                throw new Error("Method not implemented.");}
        }();
        const startTimerCall = jest.fn();
        const pauseTimerCall = jest.fn();
        const resetTimerCall = jest.fn();
        const timerObject = new class extends DummyTimer{
            startTimer(): void {startTimerCall();}
            pauseTimer(): void {pauseTimerCall();}
            resetTimer(): void {resetTimerCall();}
        }();
        const view = mount(<PomodoroTimerViewController
            countdownTimer={timerObject}
            pomodoroState={stateObject}
        />);
        const timerContainer = view.find("#timer_container");
        const runButton = timerContainer.find('#run_button');
        const resetButton = timerContainer.find('#reset_button');
        const minutesLabel = timerContainer.find('#minutes_label');
        const secondsLabel = timerContainer.find('#seconds_label');
        const iconNameStart = 'controller-play';
        const iconNamePause = 'controller-paus';
        const iconNameReset = 'ccw';
        
        // run button should trigger play
        expect(runButton.find('Icon').name).toBe(iconNameStart);
        runButton.simulate('click');
        // runButton.props().onClick();
        // runButton.prop('onClick')();
        expect(startTimerCall).toBeCalledTimes(1);
        timerObject.isRunning = true;

        // run button should switch to trigger pause
        timerObject.onTimerToggleSubject.next(timerObject);
        expect(runButton.find('Icon').name).toBe(iconNamePause);
        runButton.simulate('click');
        expect(pauseTimerCall).toBeCalledTimes(1);
        timerObject.isRunning = false;

        // run button should switch to trigger play
        timerObject.onTimerToggleSubject.next(timerObject);
        expect(runButton.find('Icon').name).toBe(iconNameStart);
        runButton.simulate('click');
        expect(startTimerCall).toBeCalledTimes(2);
        timerObject.isRunning = true;

        // reset button should trigger callback
        expect(resetButton.find('Icon').name).toBe(iconNameReset);
        resetButton.simulate('click');
        expect(resetTimerCall).toBeCalledTimes(1);

        // clock items should update automatically
        timerObject.time = new MinutesSeconds(25, 0);
        timerObject.onTimerUpdateSubject.next(timerObject);
        expect(minutesLabel.text).toBe('25');
        expect(secondsLabel.text).toBe('00');

        timerObject.time = new MinutesSeconds(2, 45);
        timerObject.onTimerUpdateSubject.next(timerObject);
        expect(minutesLabel.text).toBe('02');
        expect(secondsLabel.text).toBe('45');
    })

    class DummyTimer implements CountdownTimerInterface<MinutesSeconds>{
        readonly onTimerUpdateSubject = new Subject<DummyTimer>();
        readonly onTimerToggleSubject = new Subject<DummyTimer>();
        time = new MinutesSeconds(0, 0);
        isRunning = false;
        onCountdownUpdate(): Observable<any> {
            return this.onTimerUpdateSubject.asObservable();
        }
        onCountdownToggle(): Observable<DummyTimer> {
            return this.onTimerToggleSubject.asObservable();
        }
        onCountdownFinish(): Observable<any> {
            throw new Error("Method not implemented.");
        }
        getCurrentTime(): MinutesSeconds {
            return this.time;
        }
        isTimerRunning(): boolean {
            return this.isRunning;
        }
        // implemented inside tests
        startTimer(): void {throw new Error("Method not implemented.");}
        pauseTimer(): void {throw new Error("Method not implemented.");}
        resetTimer(): void {throw new Error("Method not implemented.");}
    };
})
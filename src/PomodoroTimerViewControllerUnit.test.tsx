import React from "react"
import { Observable, Subject } from "rxjs"
import '@testing-library/jest-native/extend-expect'
import { render, fireEvent, act, cleanup } from '@testing-library/react-native'
import { ReactTestInstance } from "react-test-renderer"
import Timer from './Timer.interface'
import PomodoroTimerViewController, { TimerButtonSettingsStart, TimerButtonSettingsPause, TimerButtonSettingsReset } from './PomodoroTimerViewController'
import PomodoroStateChangeInterface, { PomodoroState } from './PomodoroStateChangeInterface'
import { TouchableHighlight } from "react-native-gesture-handler";
import { isObject, findAnyByTestID, findAnyByName } from "./utils/TestingUtils";
import { MinutesSeconds } from "./TimeFormats"

describe('PomodoroTimerView', () => {

    afterEach(() => cleanup())

    it('test timer buttons & responses', async () => {
        const iconNameStart = TimerButtonSettingsStart.iconName
        const iconNamePause = TimerButtonSettingsPause.iconName
        const iconNameReset = TimerButtonSettingsReset.iconName
        const stateObject = new DummyState()
        const timerObject = new DummyTimer()
        const vc = <PomodoroTimerViewController
            countdownTimer={timerObject}
            pomodoroState={stateObject}
        />        
        const ren = render(vc)
        const root = ren.container
        const buttonRun = findAnyByTestID(root, 'run_button') as ReactTestInstance
        expect(isObject(buttonRun)).toBeTruthy()
        const buttonReset = findAnyByTestID(root, 'reset_button') as ReactTestInstance
        expect(isObject(buttonReset)).toBeTruthy()
        expect(findAnyByName(root, iconNameReset)).not.toBeNull()
        expect(findAnyByName(root, iconNameStart)).not.toBeNull()
        expect(findAnyByName(root, iconNamePause)).toBeNull()

        timerObject.resetTimer=jest.fn()
        await fireEvent(buttonReset.findByType(TouchableHighlight), 'onPress')
        await expect(timerObject.resetTimer).toBeCalledTimes(1)

        timerObject.startTimer=jest.fn()
        await fireEvent(buttonRun.findByType(TouchableHighlight), 'onPress')
        await expect(timerObject.startTimer).toBeCalledTimes(1)
        await act(async ()=>{
            timerObject.isRunning = true
            timerObject.onTimerToggleSubject.next(timerObject)
        })
        await expect(findAnyByName(root, iconNameStart)).toBeNull()
        await expect(findAnyByName(root, iconNamePause)).not.toBeNull()

        timerObject.pauseTimer=jest.fn()
        await fireEvent(buttonRun.findByType(TouchableHighlight), 'onPress')
        await expect(timerObject.pauseTimer).toBeCalledTimes(1)
        await act(async ()=>{
            timerObject.isRunning = false
            timerObject.onTimerToggleSubject.next(timerObject)
        })
        await expect(findAnyByName(ren.container, iconNameStart)).not.toBeNull()
        await expect(findAnyByName(ren.container, iconNamePause)).toBeNull()

        timerObject.startTimer=jest.fn()
        await fireEvent(buttonRun.findByType(TouchableHighlight), 'onPress')
        await expect(timerObject.startTimer).toBeCalledTimes(1)
        await act(async ()=>{
            timerObject.isRunning = true
            timerObject.onTimerToggleSubject.next(timerObject)
        })
        await expect(findAnyByName(root, iconNameStart)).toBeNull()
        await expect(findAnyByName(root, iconNamePause)).not.toBeNull()

        await act(async ()=>{
            timerObject.isRunning = false
            timerObject.onTimerFinishSubject.next(timerObject)
        })
        await expect(findAnyByName(ren.container, iconNameStart)).not.toBeNull()
        await expect(findAnyByName(ren.container, iconNamePause)).toBeNull()
    })

    it('test time display', async () => {
        const timerObject = new DummyTimer()
        const vc = <PomodoroTimerViewController
            countdownTimer={timerObject}
            pomodoroState={new DummyState()}
        />
        const ren = render(vc);
        const clock = await ren.queryByTestId('countdown_clock') as ReactTestInstance
        expect(isObject(clock)).toBeTruthy()

        const minutesLabel = await ren.queryByTestId('minutes_label')
        const secondsLabel = await ren.queryByTestId('seconds_label')
        await act(async()=>{
            timerObject.time = new MinutesSeconds(25, 0);
            timerObject.onTimerUpdateSubject.next(timerObject);
        })
        expect(minutesLabel).toHaveTextContent('25');
        expect(secondsLabel).toHaveTextContent('00');

        await act(async()=>{
            timerObject.time = new MinutesSeconds(2, 45);
            timerObject.onTimerUpdateSubject.next(timerObject);
        })
        expect(minutesLabel).toHaveTextContent('02');
        expect(secondsLabel).toHaveTextContent('45');
    })    
})

class DummyTimer implements Timer<MinutesSeconds>{
    readonly onTimerUpdateSubject = new Subject<DummyTimer>();
    readonly onTimerToggleSubject = new Subject<DummyTimer>();
    readonly onTimerFinishSubject = new Subject<DummyTimer>();
    time = new MinutesSeconds(0, 0);
    isRunning = false;
    onTimerUpdate(): Observable<any> {
        return this.onTimerUpdateSubject.asObservable();
    }
    onTimerToggle(): Observable<DummyTimer> {
        return this.onTimerToggleSubject.asObservable();
    }
    onTimerFinish(): Observable<any> {
        return this.onTimerFinishSubject.asObservable();
    }
    getCurrentTime(): MinutesSeconds {
        return this.time;
    }
    isTimerRunning(): boolean {
        return this.isRunning;
    }
    startTimer(): void {throw new Error("Method not implemented.");}
    pauseTimer(): void {throw new Error("Method not implemented.");}
    resetTimer(): void {throw new Error("Method not implemented.");}
};

class DummyState implements PomodoroStateChangeInterface{
    onPomodoroStateChange(): Observable<PomodoroStateChangeInterface> {
        throw new Error("Method not implemented.");}
    getPomodoroState(): PomodoroState {
        throw new Error("Method not implemented.");}
    skipPomodoroState(): void {
        throw new Error("Method not implemented.");}
};

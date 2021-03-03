import CountdownTimer from './CountdownTimer';
import JestUnitHandler, {expectCloseTo} from "./utils/testUtils"

describe('CountdownTimer', () => {
    const TIMER_TEST_PRECISION_MS = 100;
    const jestHandler = new JestUnitHandler(true);

    beforeEach(async () => {
        jestHandler.beginUnitTest();
    });
    
    afterEach(async () => {
        jestHandler.finishUnitTest();
    });

    it('test value assignment', async () => {
        // time on setup should be uninitialized
        const timer = new CountdownTimer();
        expect(timer.getInitialTime()).toBe(0);
        expect(timer.getCurrentTime()).toBe(0);

        // changing the initial time in its standby state
        // should also update the current time
        timer.setInitialTime(12300);
        expect(timer.getInitialTime()).toBe(12300);
        expect(timer.getCurrentTime()).toBe(12300);

        // changing the initial time while running
        // should not change the current time
        timer.startTimer();
        await jestHandler.delay(500);
        timer.setInitialTime(45600);
        expect(timer.getInitialTime()).toBe(45600);
        expect(timer.getCurrentTime()).toBeLessThan(12300);

        // changing the initial time while paused
        // should not change the current time
        timer.pauseTimer();
        timer.setInitialTime(78900);
        expect(timer.getInitialTime()).toBe(78900);
        expect(timer.getCurrentTime()).toBeLessThan(12300);
    })

    it('test flow simple', async () => {
        const timer = new CountdownTimer();
        const initialTime = 4000;
        timer.setInitialTime(initialTime);
        const onFinish = jest.fn();
        const onFinishSubscription = timer.onCountdownFinish()
            .subscribe(() => onFinish());
        timer.startTimer();

        // timer should actually be counting down
        await jestHandler.delay(2555);
        expectCloseTo(timer.getCurrentTime(), 1500, TIMER_TEST_PRECISION_MS);

        // timer should've reached 0 by now
        await jestHandler.delay(1555);
        expectCloseTo(timer.getCurrentTime(), 0, TIMER_TEST_PRECISION_MS);

        // the timer shouldn't count below 0
        await jestHandler.delay(555);
        expect(timer.getCurrentTime()).toBe(0);

        // completion event needs to have been called
        // but give it another cycle to be triggered
        await jestHandler.delay(1);
        expect(onFinish).toBeCalledTimes(1);
        onFinishSubscription.unsubscribe();

        // timer should return to its initial state
        timer.resetTimer();
        expect(timer.getCurrentTime()).toBe(initialTime);
    })

    it('test flow interrupted', async () => {
        const timer = new CountdownTimer();
        timer.setInitialTime(1000);
        timer.startTimer();
        await jestHandler.delay(555);

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 500, TIMER_TEST_PRECISION_MS);

        // the current time should freeze while paused
        const timeAtPause = timer.getCurrentTime();
        timer.pauseTimer();
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(timeAtPause);

        // the current time should be updating again when resuming
        timer.startTimer();
        await jestHandler.delay(555);
        expect(timer.getCurrentTime()).toBe(0);
    })

    it('test flow premature reset', async () => {
        const timer = new CountdownTimer();
        const initialTime = 1000;
        timer.setInitialTime(initialTime);
        timer.startTimer();
        await jestHandler.delay(255);

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);

        // the current time needs to be set back to start
        timer.resetTimer();
        expect(timer.getCurrentTime()).toBe(initialTime);

        // timer should have been paused after reset
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(initialTime);

        // the timer should be able to run again after reset
        timer.startTimer();
        await jestHandler.delay(255);
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);
    })

    it('test time update and toggle', async () => {
        const timer = new CountdownTimer();
        const initialTime = 1500;
        timer.setInitialTime(initialTime);

        // with each update the current time has to decrease
        var previousTimeMS = initialTime;
        const onUpdate = jest.fn((_timer : CountdownTimer)  => {
            expect(_timer.getCurrentTime()).toBeLessThan(previousTimeMS);
            previousTimeMS = _timer.getCurrentTime();
            ++numberOfUpdateCalls;
        });
        const onUpdateSubscription = timer.onCountdownUpdate()
            .subscribe(_timer => onUpdate(_timer));
        const onToggle = jest.fn();
        const onToggleSubscription = timer.onCountdownToggle()
            .subscribe(_timer => onToggle());
        
        // the update must have been called multiple times now
        var numberOfUpdateCalls = 0;
        expect(onToggle).toBeCalledTimes(0);
        timer.startTimer();
        expect(onToggle).toBeCalledTimes(1);
        await jestHandler.delay(555);
        // there is no function toBeCalledGreaterThanOrEqualTimes
        expect(numberOfUpdateCalls).toBeGreaterThanOrEqual(3);

        // the timer should stop on pause
        numberOfUpdateCalls = 0;
        timer.pauseTimer();
        expect(onToggle).toBeCalledTimes(2);
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBe(0);

        // the update must have been resumed now
        numberOfUpdateCalls = 0;
        timer.startTimer();
        expect(onToggle).toBeCalledTimes(3);
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBeGreaterThanOrEqual(3);
    })
})
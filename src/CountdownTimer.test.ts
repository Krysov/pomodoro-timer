import CountdownTimer from './CountdownTimer';
import JestUnitHandler, {expectCloseTo} from "./utils/testUtils"

const TIMER_TEST_PRECISION_MS = 100;
const jestHandler = new JestUnitHandler(true);

describe('CountdownTimer', () => {

    it('test value assignment', async () => {
        jestHandler.beginUnitTest();

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
        timer.run();
        await jestHandler.delay(500);
        timer.setInitialTime(45600);
        expect(timer.getInitialTime()).toBe(45600);
        expect(timer.getCurrentTime()).toBeLessThan(12300);

        // changing the initial time while paused
        // should not change the current time
        timer.pause();
        timer.setInitialTime(78900);
        expect(timer.getInitialTime()).toBe(78900);
        expect(timer.getCurrentTime()).toBeLessThan(12300);

        jestHandler.finishUnitTest();
    })

    it('test flow simple', async () => {
        jestHandler.beginUnitTest();

        const timer = new CountdownTimer();
        const initialTime = 4000;
        timer.setInitialTime(initialTime);
        const onFinish = jest.fn();
        const onFinishSubscription = timer.onCountdownFinish()
            .subscribe(() => onFinish());
        timer.run();

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
        timer.reset();
        expect(timer.getCurrentTime()).toBe(initialTime);

        jestHandler.finishUnitTest();
    })

    it('test flow interrupted', async () => {
        jestHandler.beginUnitTest();

        const timer = new CountdownTimer();
        timer.setInitialTime(1000);
        timer.run();
        await jestHandler.delay(555);

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 500, TIMER_TEST_PRECISION_MS);

        // the current time should freeze while paused
        const timeAtPause = timer.getCurrentTime();
        timer.pause();
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(timeAtPause);

        // the current time should be updating again when resuming
        timer.run();
        await jestHandler.delay(555);
        expect(timer.getCurrentTime()).toBe(0);

        jestHandler.finishUnitTest();
    })

    it('test flow premature reset', async () => {
        jestHandler.beginUnitTest();

        const timer = new CountdownTimer();
        const initialTime = 1000;
        timer.setInitialTime(initialTime);
        timer.run();
        await jestHandler.delay(255);

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);

        // the current time needs to be set back to start
        timer.reset();
        expect(timer.getCurrentTime()).toBe(initialTime);

        // timer should have been paused after reset
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(initialTime);

        // the timer should be able to run again after reset
        timer.run();
        await jestHandler.delay(255);
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);

        jestHandler.finishUnitTest();
    })

    it('test time update', async () => {
        jestHandler.beginUnitTest();

        const timer = new CountdownTimer();
        const initialTime = 1500;
        timer.setInitialTime(initialTime);

        // with each update the current time has to decrease
        var previousTimeMS = initialTime;
        var numberOfUpdateCalls = 0;
        const onUpdate = jest.fn((timer : CountdownTimer)  => {
            expect(timer.getCurrentTime()).toBeLessThan(previousTimeMS);
            previousTimeMS = timer.getCurrentTime();
            ++numberOfUpdateCalls;
        });
        const onUpdateSubscription = timer.onCountdownUpdate()
            .subscribe(timer => onUpdate(timer));
        timer.run();

        // the update must have been called multiple times now
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBeGreaterThanOrEqual(3);

        // the timer should stop on pause
        numberOfUpdateCalls = 0;
        timer.pause();
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBe(0);

        jestHandler.finishUnitTest();
    })
})
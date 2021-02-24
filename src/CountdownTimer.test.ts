import CountdownTimer from './CountdownTimer';

const TIMER_TEST_PRECISION_MS = 100;

describe('CountdownTimer', () => {

    function expectCloseTo(received : number, expected: number, tolerance : number ) : void {
        expect(received).toBeLessThanOrEqual(expected + tolerance);
        expect(received).toBeGreaterThanOrEqual(expected - tolerance);
    }

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
        timer.run();
        await new Promise((r) => setTimeout(r, 500));
        timer.setInitialTime(45600);
        expect(timer.getInitialTime()).toBe(45600);
        expect(timer.getCurrentTime()).toBeLessThan(12300);

        // changing the initial time while paused
        // should not change the current time
        timer.pause();
        timer.setInitialTime(78900);
        expect(timer.getInitialTime()).toBe(78900);
        expect(timer.getCurrentTime()).toBeLessThan(12300);
    })

    it('test flow simple', async () => {
        const timer = new CountdownTimer();
        timer.setInitialTime(4000);
        const onFinish = jest.fn();
        const onFinishSubscription = timer.onCountdownFinish().subscribe(() => onFinish());
        timer.run();

        // timer should actually be counting down
        await new Promise((r) => setTimeout(r, 2555));
        expectCloseTo(timer.getCurrentTime(), 1500, TIMER_TEST_PRECISION_MS);

        // timer should've reached 0 by now
        await new Promise((r) => setTimeout(r, 1555));
        expectCloseTo(timer.getCurrentTime(), 0, TIMER_TEST_PRECISION_MS);

        // the timer shouldn't count below 0
        await new Promise((r) => setTimeout(r, 555));
        expect(timer.getCurrentTime()).toBe(0);

        // completion event needs to have been called
        // but give it another cycle to be triggered
        await new Promise((r) => setTimeout(r, 1));
        expect(onFinish).toBeCalledTimes(1);
        onFinishSubscription.unsubscribe();

        // timer should return to its initial state
        timer.reset();
        expect(timer.getCurrentTime()).toBe(4000);
    })

    it('test flow interrupted', async () => {
        const timer = new CountdownTimer();
        timer.setInitialTime(1000);
        timer.run();
        await new Promise((r) => setTimeout(r, 555));

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 500, TIMER_TEST_PRECISION_MS);

        // the current time should freeze while paused
        const timeAtPause = timer.getCurrentTime();
        timer.pause();
        await new Promise((r) => setTimeout(r, 255));
        expect(timer.getCurrentTime()).toBe(timeAtPause);

        // the current time should be updating again when resuming
        timer.run();
        await new Promise((r) => setTimeout(r, 555));
        expect(timer.getCurrentTime()).toBe(0);
    })

    it('test flow premature reset', async () => {
        const timer = new CountdownTimer();
        const initialTime = 1000;
        timer.setInitialTime(initialTime);
        timer.run();
        await new Promise((r) => setTimeout(r, 255));

        // make sure that the test case works properly
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);

        // the current time needs to be set back to start
        timer.reset();
        expect(timer.getCurrentTime()).toBe(initialTime);

        // timer should have been paused after reset
        await new Promise((r) => setTimeout(r, 255));
        expect(timer.getCurrentTime()).toBe(initialTime);

        // the timer should be able to run again after reset
        timer.run();
        await new Promise((r) => setTimeout(r, 255));
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);
    })
})
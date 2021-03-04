import CountdownTimer from './CountdownTimer';
import JestUnitHandler, {expectCloseTo} from "./utils/TestingUtils"

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
        const timer = new CountdownTimer();
        expect(timer.getInitialTime()).toBe(0);
        expect(timer.getCurrentTime()).toBe(0);

        timer.setInitialTime(12300);
        expect(timer.getInitialTime()).toBe(12300);
        expect(timer.getCurrentTime()).toBe(12300);

        timer.startTimer();
        await jestHandler.delay(500);
        timer.setInitialTime(45600);
        expect(timer.getInitialTime()).toBe(45600);
        expect(timer.getCurrentTime()).toBeLessThan(12300);

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

        await jestHandler.delay(2555);
        expectCloseTo(timer.getCurrentTime(), 1500, TIMER_TEST_PRECISION_MS);

        // timer should've reached 0
        await jestHandler.delay(1555);
        expectCloseTo(timer.getCurrentTime(), 0, TIMER_TEST_PRECISION_MS);

        // the timer shouldn't count below 0
        await jestHandler.delay(555);
        expect(timer.getCurrentTime()).toBe(0);

        await jestHandler.delay(1);
        expect(onFinish).toBeCalledTimes(1);
        onFinishSubscription.unsubscribe();

        const onUpdate = jest.fn();
        const onUpdateSubscription = timer.onCountdownUpdate()
            .subscribe(() => onUpdate());
        timer.resetTimer();
        expect(timer.getCurrentTime()).toBe(initialTime);
        expect(onUpdate).toBeCalledTimes(1);
    })

    it('test flow interrupted', async () => {
        const timer = new CountdownTimer();
        timer.setInitialTime(1000);

        timer.startTimer();
        await jestHandler.delay(555);
        expectCloseTo(timer.getCurrentTime(), 500, TIMER_TEST_PRECISION_MS);

        const timeAtPause = timer.getCurrentTime();
        timer.pauseTimer();
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(timeAtPause);

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
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);

        timer.resetTimer();
        expect(timer.getCurrentTime()).toBe(initialTime);
        await jestHandler.delay(255);
        expect(timer.getCurrentTime()).toBe(initialTime);

        timer.startTimer();
        await jestHandler.delay(255);
        expectCloseTo(timer.getCurrentTime(), 750, TIMER_TEST_PRECISION_MS);
    })

    it('test time update and toggle', async () => {
        const timer = new CountdownTimer();
        const initialTime = 1500;
        timer.setInitialTime(initialTime);

        var previousTimeMS = initialTime;
        const onUpdate = jest.fn((_timer : CountdownTimer)  => {
            // with each update the current time has to decrease
            expect(_timer.getCurrentTime()).toBeLessThan(previousTimeMS);
            previousTimeMS = _timer.getCurrentTime();
            ++numberOfUpdateCalls;
        });
        const onUpdateSubscription = timer.onCountdownUpdate()
            .subscribe(_timer => onUpdate(_timer));
        const onToggle = jest.fn();
        const onToggleSubscription = timer.onCountdownToggle()
            .subscribe(_timer => onToggle());
        
        var numberOfUpdateCalls = 0;
        expect(onToggle).toBeCalledTimes(0);
        timer.startTimer();
        expect(onToggle).toBeCalledTimes(1);
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBeGreaterThanOrEqual(3);

        // should pause
        numberOfUpdateCalls = 0;
        timer.pauseTimer();
        expect(onToggle).toBeCalledTimes(2);
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBe(0);

        // should resume
        numberOfUpdateCalls = 0;
        timer.startTimer();
        expect(onToggle).toBeCalledTimes(3);
        await jestHandler.delay(555);
        expect(numberOfUpdateCalls).toBeGreaterThanOrEqual(3);
    })

    it('test timer speed and integrity', async () => {
        const timer = new CountdownTimer();
        const initialTime = 5000;
        timer.setInitialTime(initialTime);
        timer.startTimer();
        timer.pauseTimer();
        timer.startTimer();
        timer.resetTimer();
        timer.startTimer();
        timer.resetTimer();
        timer.startTimer();
        await jestHandler.delay(5);
        timer.pauseTimer();
        await jestHandler.delay(5);
        timer.startTimer();
        
        await jestHandler.delay(1005);
        expectCloseTo(timer.getCurrentTime(), 4000, TIMER_TEST_PRECISION_MS);
        await jestHandler.delay(1005);
        expectCloseTo(timer.getCurrentTime(), 3000, TIMER_TEST_PRECISION_MS);
        await jestHandler.delay(1005);
        expectCloseTo(timer.getCurrentTime(), 2000, TIMER_TEST_PRECISION_MS);
        await jestHandler.delay(1005);
        expectCloseTo(timer.getCurrentTime(), 1000, TIMER_TEST_PRECISION_MS);
        await jestHandler.delay(1005);
        expectCloseTo(timer.getCurrentTime(), 0, TIMER_TEST_PRECISION_MS);
    })
})
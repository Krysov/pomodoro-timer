import PomodoroTimerViewModel from "./PomodoroTimerViewModel"
import ProfileStoreInterface from "./ProfileStoreInterface"
import { PomodoroState } from "./PomodoroStateChangeInterface";
import JestUnitHandler from "./utils/TestingUtils"
import CountdownTimer from "./CountdownTimer";


describe('PomodoroTimerViewModel', () => {
    const jestHandler = new JestUnitHandler(true);

    beforeEach(async () => {
        jestHandler.beginUnitTest();
    });
    
    afterEach(async () => {
        jestHandler.finishUnitTest();
    });

    it('test flow normal', async () => {
        const store = new DummyStore();
        const timer = new CountdownTimer();
        const model = new PomodoroTimerViewModel(store, timer);

        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        for(var i:number = 1; i < store.getStateIterationsBeforeRecess(); ++i){
            await traversePomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
            await traversePomodoroState(model, PomodoroState.Break, store.getStateDurationBreak());
        }
        await traversePomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
        await traversePomodoroState(model, PomodoroState.Recess, store.getStateDurationRecess());
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
    })

    async function traversePomodoroState(model : PomodoroTimerViewModel, expectedState : PomodoroState, durationMS : number){
        const initialState = model.getPomodoroState();
        expect(initialState).toBe(expectedState);

        let onChangeState : any = jest.fn(_model => {
            expect(_model).toBeInstanceOf(PomodoroTimerViewModel)
            const newState = _model.getPomodoroState();
            // updates should only occur on state changes
            expect(newState).not.toBe(initialState);
        })
        const onChangeStateSubscription = model.onPomodoroStateChange()
            .subscribe(_model => (onChangeState!==undefined)?onChangeState(_model):{});
        
        model.startTimer();
        await jestHandler.delay(durationMS);
        expect(onChangeState).toBeCalledTimes(1);

        onChangeState = undefined; // typescript requires this var to be cleared to avoid concurrent subscriptions
        onChangeStateSubscription.unsubscribe;
    }

    it('test flow interruption', async () => {
        const store = new DummyStore();
        const timer = new CountdownTimer();
        const model = new PomodoroTimerViewModel(store, timer);

        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        model.startTimer();
        expect(model.isTimerRunning()).toBe(true);
        await jestHandler.delay(155);

        model.pauseTimer();
        expect(model.isTimerRunning()).toBe(false);
        await jestHandler.delay(155);

        model.startTimer();
        expect(model.isTimerRunning()).toBe(true);
        await jestHandler.delay(155);

        model.resetTimer();
        expect(model.isTimerRunning()).toBe(false);
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        await jestHandler.delay(155);

        model.startTimer();
        expect(model.isTimerRunning()).toBe(true);
    })

    it('test flow skip state', async () => {
        const store = new DummyStore();
        const timer = new CountdownTimer();
        const model = new PomodoroTimerViewModel(store, timer);

        // skip while timer is paused
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        model.skipPomodoroState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);
        model.skipPomodoroState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        // skip while timer is running
        model.startTimer();
        await jestHandler.delay(155);
        model.skipPomodoroState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);
    })

    it('test time output', async () => {
        const store = new DummyStore();
        // set initial time to 25m:00s
        store.setStateDurationWork(1500000);
        const timer = new CountdownTimer();
        const model = new PomodoroTimerViewModel(store, timer);
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        let time = model.getCurrentTime();
        let expectedMinutes:string = "25"
        let expectedSeconds:string = "00"
        expect(time.partMinutes).toBe(expectedMinutes);
        expect(time.partSeconds).toBe(expectedSeconds);

        // let 15 seconds pass from 25m:00s to 24m:45s
        model.startTimer();
        await jestHandler.delay(15000);
        expectedMinutes = "24";
        expectedSeconds = "45";
        time = model.getCurrentTime();
        expect(time.partMinutes).toBe(expectedMinutes);
        expect(time.partSeconds).toBe(expectedSeconds);
    })

    class DummyStore implements ProfileStoreInterface{
        private _durationWork : number = 5000;
        setStateDurationWork(milliseconds : number): void {
            this._durationWork = milliseconds;
        }
        getStateDurationWork(): number {
            return this._durationWork;
        }
        getStateDurationBreak(): number {
            return 1000;
        }
        getStateDurationRecess(): number {
            return 3000;
        }
        getStateIterationsBeforeRecess(): number {
            return 3;
            // the flow should be as follows:
            // ---------
            // 0: work
            // 0: break
            // ---------
            // 1: work
            // 1: break
            // ---------
            // 2: work
            // 2: recess
            // ---------
            // 0: work (back from start)
        }
    }
})
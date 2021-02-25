import PomodoroTimerViewModel from "./PomodoroTimerViewModel"
import ProfileStoreInterface from "./ProfileStoreInterface"
import PomodoroStateChangeInterface, { PomodoroState } from "./PomodoroStateChangeInterface";
import JestUnitHandler from "./utils/testUtils"

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
        return 2;
    }
}

describe('PomodoroTimerViewModel', () => {
    
    const jestHandler = new JestUnitHandler(false);

    async function passPomodoroState(model : PomodoroTimerViewModel, expectedState : PomodoroState, durationMS : number){
        const initialState = model.getPomodoroState();
        expect(initialState).toBe(expectedState);
        console.log("- entering pomodoro state: " + initialState);

        const onChangeState = jest.fn((_model : PomodoroStateChangeInterface) => {
            // the new state should be a different one now
            const newState = _model.getPomodoroState();
            expect(newState).not.toBe(expectedState);
            console.log("- passed pomodoro state to: " + newState);
        });
        const onChangeStateSubscription = model.onPomodoroStateChange()
            .subscribe(_model => onChangeState(_model));
        model.run();

        // make timer of the current state run out
        await jestHandler.delay(durationMS + 5);
        
        // update should have been called by now
        expect(onChangeState).toBeCalledTimes(1);
        onChangeStateSubscription.unsubscribe;
    }

    it('test flow normal', async () => {
        jestHandler.beginUnitTest();
        console.log("testing pomodoro flow normal:");
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        // initial state should be "work"
        for(var i:number = 1; i <= store.getStateIterationsBeforeRecess(); ++i){
            await passPomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
            await passPomodoroState(model, PomodoroState.Break, store.getStateDurationBreak());
        }
        await passPomodoroState(model, PomodoroState.Recess, store.getStateDurationRecess());
        await passPomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);

        jestHandler.finishUnitTest();
    })

    it('test flow interruption', async () => {
        jestHandler.beginUnitTest();
        console.log("testing pomodoro flow with interruptions:");
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        model.run();
        expect(model.isRunning()).toBe(true);
        await jestHandler.delay(155);
        model.reset();
        expect(model.isRunning()).toBe(false);
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        jestHandler.finishUnitTest();
    })

    it('test flow skip state', async () => {
        jestHandler.beginUnitTest();
        console.log("testing pomodoro flow with skips:");
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        // initial state should be "work"
        console.log("- starting with state:" + model.getPomodoroState());
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        model.skipState();
        console.log("- skipped to state:" + model.getPomodoroState());
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);
        model.skipState();
        console.log("- skipped to state:" + model.getPomodoroState());
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        // skip should work while timer is still running
        model.run();
        await jestHandler.delay(155);
        model.skipState();
        console.log("- skipped to state during run:" + model.getPomodoroState());
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);
        model.run();
        await jestHandler.delay(155);
        model.skipState();
        console.log("- skipped to state during run:" + model.getPomodoroState());
        expect(model.getPomodoroState()).toBe(PomodoroState.Recess);

        jestHandler.finishUnitTest();
    })

    it('test time output', async () => {
        jestHandler.beginUnitTest();
        console.log("testing time output:");
        const store = new DummyStore();
        var expectedMinutes = 25;
        var expectedSeconds = 0;

        // initial state should be "work"
        store.setStateDurationWork(expectedMinutes * 60000 + expectedSeconds * 1000);
        const model = new PomodoroTimerViewModel(store);

        expect(model.getCurrentTimePartMinutes).toBe(expectedMinutes);
        expect(model.getCurrentTimePartSeconds).toBe(expectedSeconds);
        console.log("time output: " + expectedMinutes + " : " + expectedSeconds);

        // let 15 seconds pass from 25:00 to 24:45
        await jestHandler.delay(15000);
        expectedMinutes = 24;
        expectedSeconds = 45;
        expect(model.getCurrentTimePartMinutes).toBe(expectedMinutes);
        expect(model.getCurrentTimePartSeconds).toBe(expectedSeconds);
        console.log("time output: " + expectedMinutes + " : " + expectedSeconds);

        jestHandler.finishUnitTest();
    })
})
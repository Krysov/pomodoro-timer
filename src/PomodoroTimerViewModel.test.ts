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
        // 0: back from start
    }
}

const jestHandler = new JestUnitHandler(true);

describe('PomodoroTimerViewModel', () => {

    async function passPomodoroState(model : PomodoroTimerViewModel, expectedState : PomodoroState, durationMS : number){
        const initialState = model.getPomodoroState();
        expect(initialState).toBe(expectedState);

        // subscribe to state changes 
        let onChangeState : ((m:PomodoroStateChangeInterface) => void)|undefined
            = jest.fn((_model : PomodoroStateChangeInterface) => {
                // the new state should be a different one now
                const newState = _model.getPomodoroState();
                expect(newState).not.toBe(initialState);
        });
        const onChangeStateSubscription = model.onPomodoroStateChange()
            .subscribe(_model => {if(onChangeState!==undefined)onChangeState(_model)});
        
        // make timer of the current state run out
        model.run();
        await jestHandler.delay(durationMS);
        
        // update should have been called by now exactly once
        expect(onChangeState).toBeCalledTimes(1);
        onChangeState = undefined; // typescript requires me to clear this local var
        onChangeStateSubscription.unsubscribe;
    }

    it('test flow normal', async () => {
        jestHandler.beginUnitTest();
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        // initial state should be "work"
        for(var i:number = 1; i < store.getStateIterationsBeforeRecess(); ++i){
            await passPomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
            await passPomodoroState(model, PomodoroState.Break, store.getStateDurationBreak());
        }
        await passPomodoroState(model, PomodoroState.Work, store.getStateDurationWork());
        await passPomodoroState(model, PomodoroState.Recess, store.getStateDurationRecess());
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        jestHandler.finishUnitTest();
    })

    it('test flow interruption', async () => {
        jestHandler.beginUnitTest();
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        // initial state should be "work"
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        model.run();
        expect(model.isRunning()).toBe(true);
        await jestHandler.delay(155);

        model.pause();
        expect(model.isRunning()).toBe(false);
        await jestHandler.delay(155);

        model.run();
        expect(model.isRunning()).toBe(true);
        await jestHandler.delay(155);

        model.reset();
        expect(model.isRunning()).toBe(false);
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        await jestHandler.delay(155);

        model.run();
        expect(model.isRunning()).toBe(true);

        jestHandler.finishUnitTest();
    })

    it('test flow skip state', async () => {
        jestHandler.beginUnitTest();
        const store = new DummyStore();
        const model = new PomodoroTimerViewModel(store);

        // initial state should be "work"
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);
        model.skipState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);
        model.skipState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Work);

        // skip should work while timer is still running
        model.run();
        await jestHandler.delay(155);
        model.skipState();
        expect(model.getPomodoroState()).toBe(PomodoroState.Break);

        jestHandler.finishUnitTest();
    })

    it('test time output', async () => {
        jestHandler.beginUnitTest();
        const store = new DummyStore();
        var expectedMinutes = 25;
        var expectedSeconds = 0;

        // initial state should be "work"
        store.setStateDurationWork(expectedMinutes * 60000 + expectedSeconds * 1000);
        const model = new PomodoroTimerViewModel(store);

        expect(model.getCurrentTimePartMinutes()).toBe(expectedMinutes);
        expect(model.getCurrentTimePartSeconds()).toBe(expectedSeconds);

        // let 15 seconds pass from 25:00 to 24:45
        model.run();
        await jestHandler.delay(15000);
        expectedMinutes = 24;
        expectedSeconds = 45;
        expect(model.getCurrentTimePartMinutes()).toBe(expectedMinutes);
        expect(model.getCurrentTimePartSeconds()).toBe(expectedSeconds);

        jestHandler.finishUnitTest();
    })
})
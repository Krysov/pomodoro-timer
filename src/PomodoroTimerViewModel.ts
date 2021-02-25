import ProfileStoreInterface from "./ProfileStoreInterface"
import PomodoroStateChangeInterface, { PomodoroState } from "./PomodoroStateChangeInterface";
import { Observable, Subject, timer } from "rxjs";
import CountdownTimer from "./CountdownTimer";

export default class PomodoroTimerViewModel implements PomodoroStateChangeInterface{

    private readonly _timer : CountdownTimer;
    private readonly _store : ProfileStoreInterface;
    private readonly _onPomodoroStateChange : Subject<PomodoroStateChangeInterface>;

    private _state : PomodoroState;
    private _workIterations : number;
    private _isRunning : boolean = false;

    constructor(store : ProfileStoreInterface) {
        this._onPomodoroStateChange = new Subject();
        this._timer = new CountdownTimer();
        this._timer.onCountdownFinish()
            .subscribe(timer => this.gotoNextState());
        this._store = store;

        this._workIterations = 1;
        this._state = PomodoroState.Work;
        this.setupTimerForState(this._state);
    }

    getPomodoroState(): PomodoroState {
        return this._state;
    }

    onPomodoroStateChange(): Observable<PomodoroStateChangeInterface> {
        return this._onPomodoroStateChange.asObservable();
    }

    getCurrentTimePartSeconds() : number {
        const milliseconds = this._timer.getCurrentTime();
        return Math.floor(milliseconds/1000) % 60;
    }

    getCurrentTimePartMinutes() : number {
        const milliseconds = this._timer.getCurrentTime();
        return Math.floor(milliseconds/60000);
    }

    isRunning() : boolean {
        return this._isRunning;
    }

    run(){
        this._isRunning = true;
        this._timer.run();
    }

    pause(){
        this._isRunning = false;
        this._timer.pause();
    }

    reset(){
        this._isRunning = false;
        this._timer.reset();
    }

    skipState(){
        this.gotoNextState();
    }

    private gotoNextState(){
        const initialState = this._state;
        var nextState : PomodoroState;
        if(initialState === PomodoroState.Work){
            if(this._workIterations >= this._store.getStateIterationsBeforeRecess()){
                nextState = PomodoroState.Recess;
            }else nextState = PomodoroState.Break;
        }else{
            nextState = PomodoroState.Work;
        }
        if(nextState === PomodoroState.Work){
            ++this._workIterations;
        }else if(nextState === PomodoroState.Recess){
            this._workIterations = 0;
        }
        this.setState(nextState);
    }

    private setState(state : PomodoroState){
        const didChange = this._state !== state;
        this._state = state;
        this.setupTimerForState(state);
        if(didChange) this._onPomodoroStateChange.next(this);
    }

    private setupTimerForState(state : PomodoroState){
        this._timer.reset();
        switch(state){
            case PomodoroState.Work:
                this._timer.setInitialTime(this._store.getStateDurationWork());
                break;
            case PomodoroState.Break:
                this._timer.setInitialTime(this._store.getStateDurationBreak());
                break;
            case PomodoroState.Recess:
                this._timer.setInitialTime(this._store.getStateDurationRecess());
                break;
        }
    }
}
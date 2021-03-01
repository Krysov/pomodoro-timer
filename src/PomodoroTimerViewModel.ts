import ProfileStoreInterface from "./ProfileStoreInterface"
import PomodoroStateChangeInterface, { PomodoroState } from "./PomodoroStateChangeInterface";
import { Observable, Subject } from "rxjs";
import CountdownTimer from "./CountdownTimer";
import CountdownTimerInterface from "./CountdownTimerInterface";

export class MinutesSeconds{
    readonly partMinutes : number;
    readonly partSeconds : number;

    constructor(_minutes : number, _seconds : number){
        this.partMinutes = _minutes;
        this.partSeconds = _seconds;
    }
}

export default class PomodoroTimerViewModel implements
    PomodoroStateChangeInterface, CountdownTimerInterface<MinutesSeconds>{

    private readonly _timer : CountdownTimer;
    private readonly _store : ProfileStoreInterface;
    private readonly _onPomodoroStateChange : Subject<PomodoroStateChangeInterface>;
    private readonly _onTimerUpdateSubject : Subject<PomodoroTimerViewModel>;
    private readonly _onTimerToggleSubject : Subject<PomodoroTimerViewModel>;
    private readonly _onTimerFinishSubject : Subject<PomodoroTimerViewModel>;

    private _state : PomodoroState;
    private _workIterations : number;

    constructor(store : ProfileStoreInterface) {
        this._onPomodoroStateChange = new Subject();
        this._onTimerUpdateSubject = new Subject();
        this._onTimerToggleSubject = new Subject();
        this._onTimerFinishSubject = new Subject();
        this._timer = new CountdownTimer();
        this._timer.onCountdownUpdate()
            .subscribe(timer => this._onTimerUpdateSubject.next(this));
        this._timer.onCountdownToggle()
            .subscribe(timer => this._onTimerToggleSubject.next(this));
        this._timer.onCountdownFinish()
            .subscribe(timer => {
                this.gotoNextState();
                this._onTimerFinishSubject.next(this);
            });
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

    skipPomodoroState(){
        this.gotoNextState();
    }

    isTimerRunning() : boolean {
        return this._timer.isTimerRunning();
    }

    startTimer(){
        this._timer.startTimer();
    }

    pauseTimer(){
        this._timer.pauseTimer();
    }

    resetTimer(){
        this._timer.resetTimer();
    }

    getCurrentTime(){
        const milliseconds = this._timer.getCurrentTime();
        return new MinutesSeconds(
            Math.floor(milliseconds/60000) % 60,
            Math.floor(milliseconds/1000) % 60
        );
    }

    onCountdownUpdate(): Observable<PomodoroTimerViewModel> {
        return this._onTimerUpdateSubject;
    }

    onCountdownToggle(): Observable<PomodoroTimerViewModel> {
        return this._onTimerToggleSubject;
    }

    onCountdownFinish(): Observable<PomodoroTimerViewModel> {
        return this._onTimerFinishSubject;
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
        this._timer.resetTimer();
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
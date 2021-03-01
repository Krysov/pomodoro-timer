import { Observable, Subscription, Subject, interval } from 'rxjs';
import CountdownTimerInterface from './CountdownTimerInterface'

enum TimerState {
    Standby,
    Running,
    Waiting,
}

export type Milliseconds = number;

export default class CountdownTimer implements CountdownTimerInterface<Milliseconds>{
    private static readonly TIMER_INTERVAL_MS : number = 100;

    private _initialTimeMS : number = 0;
    private _currentTimeMS : number = 0;
    private _state : TimerState = TimerState.Standby;
    private _intervalSubscription? : Subscription = undefined;
    private readonly _onTimerUpdateSubject : Subject<CountdownTimer>;
    private readonly _onTimerToggleSubject : Subject<CountdownTimer>;
    private readonly _onTimerFinishSubject : Subject<CountdownTimer>;

    constructor() {
        this._onTimerUpdateSubject = new Subject<CountdownTimer>();
        this._onTimerToggleSubject = new Subject<CountdownTimer>();
        this._onTimerFinishSubject = new Subject<CountdownTimer>();
    }

    setInitialTime(milliseconds : number) : void {
        this._initialTimeMS = milliseconds;
        if(this._state === TimerState.Standby){
            this._currentTimeMS = milliseconds;
        }
    }

    getInitialTime() : number {
        return this._initialTimeMS;
    }

    getCurrentTime() : Milliseconds {
        return this._currentTimeMS;
    }

    onCountdownUpdate() : Observable<CountdownTimer> {
        return this._onTimerUpdateSubject.asObservable();
    }
    
    onCountdownToggle() : Observable<CountdownTimer> {
        return this._onTimerToggleSubject.asObservable();
    }

    onCountdownFinish() : Observable<CountdownTimer> {
        return this._onTimerFinishSubject.asObservable();
    }

    isTimerRunning() : boolean {
        return this._state == TimerState.Running;
    }

    startTimer() : void {
        if(!this.isTimerRunning()){
            this._intervalSubscription = interval(CountdownTimer.TIMER_INTERVAL_MS)
                .subscribe(() => this.onTick());
            this.setState(TimerState.Running);
        }
    }

    pauseTimer() : void {
        if(this.isTimerRunning()){
            this._intervalSubscription?.unsubscribe();
            this._intervalSubscription = undefined;
            this.setState(TimerState.Waiting);
        }
    }

    resetTimer() : void {
        this.pauseTimer();
        this._currentTimeMS = this._initialTimeMS;
        this.setState(TimerState.Standby);
    }

    private setState(state : TimerState){
        if(state === this._state) return;
        if(state === TimerState.Running || this._state === TimerState.Running){
            this._onTimerToggleSubject.next(this);
        }
        this._state = state;
    }

    private onTick(){
        if(!this.isTimerRunning()) return;

        this._currentTimeMS = Math.max(0, 
            this._currentTimeMS - CountdownTimer.TIMER_INTERVAL_MS);
        this._onTimerUpdateSubject.next(this);
        
        if(this._currentTimeMS === 0){
            this.pauseTimer();
            this._onTimerFinishSubject.next(this);
        }
    }
}
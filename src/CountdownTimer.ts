import { Observable, Subscription, Subject, interval } from 'rxjs';

enum TimerState {
    Standby,
    Running,
    Waiting,
}

export default class CountdownTimer {
    private static readonly TIMER_INTERVAL_MS : number = 100;

    private _initialTimeMS : number = 0;
    private _currentTimeMS : number = 0;
    private _state : TimerState = TimerState.Standby;
    private _intervalSubscription? : Subscription = undefined;
    private readonly _onTimerUpdatedSubject : Subject<CountdownTimer>;
    private readonly _onTimerFinishSubject : Subject<CountdownTimer>;

    constructor() {
        this._onTimerUpdatedSubject = new Subject<CountdownTimer>();
        this._onTimerFinishSubject = new Subject<CountdownTimer>();
    }

    onCountdownUpdate() : Observable<CountdownTimer> {
        return this._onTimerUpdatedSubject.asObservable();
    }
    
    onCountdownFinish() : Observable<CountdownTimer> {
        return this._onTimerFinishSubject.asObservable();
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

    getCurrentTime() : number {
        return this._currentTimeMS;
    }

    run() : void {
        if(!this.isRunning()){
            this._intervalSubscription = interval(CountdownTimer.TIMER_INTERVAL_MS)
                .subscribe(() => this.onTick());
            this._state = TimerState.Running;
        }
    }

    pause() : void {
        if(this.isRunning()){
            this._intervalSubscription?.unsubscribe();
            this._intervalSubscription = undefined;
            this._state = TimerState.Waiting;
        }
    }

    reset() : void {
        this.pause();
        this._currentTimeMS = this._initialTimeMS;
        this._state = TimerState.Standby;
    }

    private isRunning() : boolean {
        return this._state == TimerState.Running;
    }

    private onTick(){
        if(!this.isRunning()) return;

        this._currentTimeMS = Math.max(0, 
            this._currentTimeMS - CountdownTimer.TIMER_INTERVAL_MS);
        this._onTimerUpdatedSubject.next(this);
        
        if(this._currentTimeMS === 0){
            this.pause();
            this._onTimerFinishSubject.next(this);
        }
    }
}
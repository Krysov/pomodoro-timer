import { Observable, Subscription, Subject, interval } from 'rxjs';
import Timer from './Timer.interface'
import InitialTime from './InitialTime.interface';
import { Milliseconds } from './TimeFormats';

enum TimerState {
    Standby,
    Running,
    Waiting,
}

export default class CountdownTimer implements 
    Timer<Milliseconds>, InitialTime<Milliseconds> {

    private static readonly TIMER_INTERVAL_MS : Milliseconds = 100;

    private _initialTime : Milliseconds = 0;
    private _currentTime : Milliseconds = 0;
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

    setInitialTime(initialTime : Milliseconds) : void {
        this._initialTime = initialTime;
        if(this._state === TimerState.Standby){
            this.setCurrentTime(initialTime);
        }
    }

    getInitialTime() : Milliseconds {
        return this._initialTime;
    }

    getCurrentTime() : Milliseconds {
        return this._currentTime;
    }

    onTimerUpdate() : Observable<CountdownTimer> {
        return this._onTimerUpdateSubject.asObservable();
    }
    
    onTimerToggle() : Observable<CountdownTimer> {
        return this._onTimerToggleSubject.asObservable();
    }

    onTimerFinish() : Observable<CountdownTimer> {
        return this._onTimerFinishSubject.asObservable();
    }

    isTimerRunning() : boolean {
        return this._state === TimerState.Running;
    }

    startTimer() : void {
        if(this.isTimerRunning()) return;
        const timeInterval = CountdownTimer.TIMER_INTERVAL_MS;
        this._intervalSubscription?.unsubscribe();
        this._intervalSubscription = interval(timeInterval)
            .subscribe(() => this.onTick(timeInterval));
        this.setState(TimerState.Running);
    }

    pauseTimer() : void {
        if(!this.isTimerRunning()) return;
        this._intervalSubscription?.unsubscribe();
        this._intervalSubscription = undefined;
        this.setState(TimerState.Waiting);
    }

    resetTimer() : void {
        this.pauseTimer();
        this.setCurrentTime(this._initialTime);
        this.setState(TimerState.Standby);
    }

    private setState(state : TimerState){
        if(state === this._state) return;
        if(state === TimerState.Running || this._state === TimerState.Running){
            this._onTimerToggleSubject.next(this);
        }
        this._state = state;
    }

    private setCurrentTime(time: Milliseconds) : void {
        if(this._currentTime === time) return;
        this._currentTime = time;
        this._onTimerUpdateSubject.next(this);
    }

    private onTick(timeDelta: Milliseconds){
        if(!this.isTimerRunning()) return;

        this.setCurrentTime(Math.max(0,
            this._currentTime - timeDelta));
        
        if(this._currentTime === 0){
            this.pauseTimer();
            this._onTimerFinishSubject.next(this);
        }
    }
}
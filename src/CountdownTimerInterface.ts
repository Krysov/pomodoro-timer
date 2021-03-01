import { Observable } from 'rxjs';

export default interface CountdownTimerInterface<TimeFormat> {
    isTimerRunning() : boolean;
    startTimer() : void;
    pauseTimer() : void;
    resetTimer() : void;
    getCurrentTime() : TimeFormat;
    onCountdownUpdate() : Observable<any & CountdownTimerInterface<TimeFormat>>
    onCountdownToggle() : Observable<any & CountdownTimerInterface<TimeFormat>>
    onCountdownFinish() : Observable<any & CountdownTimerInterface<TimeFormat>>
}
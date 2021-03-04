import { Observable } from 'rxjs';
import { TimeFormat } from "./TimeFormats";

export default interface Timer<Format extends TimeFormat> {
    isTimerRunning() : boolean;
    startTimer() : void;
    pauseTimer() : void;
    resetTimer() : void;
    getCurrentTime() : Format;
    onTimerUpdate() : Observable<any & Timer<Format>>
    onTimerToggle() : Observable<any & Timer<Format>>
    onTimerFinish() : Observable<any & Timer<Format>>
}
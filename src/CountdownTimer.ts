import { Observable } from 'rxjs';
import { EMPTY } from "rxjs";

export default class CountdownTimer {

    constructor() {
        
    }

    setInitialTime(time : Number) : void {

    }

    getInitialTime() : Number {
        return -1;
    }

    getCurrentTime() : Number {
        return -1;
    }

    run() : void {
        
    }

    pause() : void {

    }

    reset() : void {

    }

    onCountdownFinish() : Observable<void> {
        return EMPTY;
    }
}
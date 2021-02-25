import ProfileStoreInterface from "./ProfileStoreInterface"
import PomodoroStateChangeInterface, { PomodoroState } from "./PomodoroStateChangeInterface";
import { Observable } from "rxjs";

export default class PomodoroTimerViewModel implements PomodoroStateChangeInterface{

    constructor(store : ProfileStoreInterface) {
        
    }

    getPomodoroState(): PomodoroState {
        throw new Error("Method not implemented.");
    }

    onPomodoroStateChange(): Observable<PomodoroStateChangeInterface> {
        throw new Error("Method not implemented.");
    }

    getCurrentTimePartSeconds() : number {
        return -1;
    }

    getCurrentTimePartMinutes() : number {
        return -1;
    }

    isRunning() : boolean {
        throw new Error("Method not implemented.");
    }

    run(){}

    pause(){}

    reset(){}

    skipState(){}
}
import {Observable} from "rxjs"

export enum PomodoroState {
    Work,
    Break,
    Recess,
}

export default interface PomodoroStateChangeInterface {
    onPomodoroStateChange() : Observable<PomodoroStateChangeInterface>;
    getPomodoroState() : PomodoroState;
    skipPomodoroState() : void;
}
import { TimeFormat } from "./TimeFormats";

export default interface InitialTime<Format extends TimeFormat> {
    
    setInitialTime(initialTime : Format) : void
    getInitialTime() : Format
}
export interface TimeFormat{}

export class MinutesSeconds implements TimeFormat {
    readonly partMinutes : string;
    readonly partSeconds : string;

    constructor(_minutes : number, _seconds : number){
        this.partMinutes = this.get2DigitNumberStringWithLeadingZeroes(_minutes);
        this.partSeconds = this.get2DigitNumberStringWithLeadingZeroes(_seconds);
    }

    private get2DigitNumberStringWithLeadingZeroes(n: number): string {
        return ("00" + n).slice(-2)
    }
}

export type Milliseconds = number & TimeFormat;
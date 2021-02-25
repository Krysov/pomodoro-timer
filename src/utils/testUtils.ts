export default class JestUnitHandler{
    private _isFakingTime : boolean;

    constructor(isFakingTime : boolean){
        this._isFakingTime = isFakingTime;
    }

    async delay(milliseconds : number){
        if(this._isFakingTime){
            jest.advanceTimersByTime(milliseconds);
        }else{
            await new Promise(r => setTimeout(r, milliseconds));
        }
    }

    beginUnitTest(){
        if(this._isFakingTime) jest.useFakeTimers;
    }

    finishUnitTest(){
        if(this._isFakingTime) jest.useRealTimers;
    }
}

function expectCloseTo(received : number, expected: number, tolerance : number ) : void {
    expect(received).toBeLessThanOrEqual(expected + tolerance);
    expect(received).toBeGreaterThanOrEqual(expected - tolerance);
}
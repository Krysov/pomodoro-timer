import { ReactTestInstance } from "react-test-renderer";

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
        if(this._isFakingTime) jest.useFakeTimers();
    }

    finishUnitTest(){
        if(this._isFakingTime) jest.useRealTimers();
    }
}

export function expectCloseTo(received : number, expected: number, tolerance : number ) : void {
    expect(received).toBeLessThanOrEqual(expected + tolerance);
    expect(received).toBeGreaterThanOrEqual(expected - tolerance);
}

type TestingQueryResults = ReactTestInstance|Array<ReactTestInstance>|null;
export function findAnyByProps(node: ReactTestInstance, props: {[propName: string]: any}): TestingQueryResults{
    const result = node.findAllByProps(props);
    if(result.length == 0) return null;
    if(result.length == 1) return result[0];
    return result;
}

export function findAnyByName(node: ReactTestInstance, name: string): TestingQueryResults{
    return findAnyByProps(node, {'name': name});
}

export function findAnyByTestID(node: ReactTestInstance, testID: string): TestingQueryResults{
    return findAnyByProps(node, {'testID': testID});
}

export function isObject(subject:any){
    if(Array.isArray(subject)) return false;
    return subject !== null;
}
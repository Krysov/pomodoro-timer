export default interface ProfileStoreInterface {
    getStateDurationWork() : number;
    getStateDurationBreak() : number;
    getStateDurationRecess() : number;
    getStateIterationsBeforeRecess() : number;
}
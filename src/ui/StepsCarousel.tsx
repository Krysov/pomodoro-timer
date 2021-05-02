import React, { Component, ReactElement } from 'react';
import { ViewProps, ScrollView, ScrollViewProps } from "react-native";
import Animated, { call } from 'react-native-reanimated';
import { interval, Subscription } from 'rxjs';
import { Milliseconds } from '../TimeFormats';

export enum CarouselState{
    isGoing,
    isFinishing,
    isFinishingByUser,
    isResetting,
}

export default class StepsCarousel extends React.Component<StepsCarouselProps>{
    
    private _scrollView?: ScrollView|null
    private _currentOffset?: number|undefined
    private _updateSubscription?: Subscription
    private _isDragging = false;
    // private _stepProgress = 0

    private _carouselState = CarouselState.isGoing

    constructor(props: StepsCarouselProps) {
        super(props);
        this.state = { width: 0 };
        // this.setCarouselState(CarouselState.isGoing)
    }

    // private _blockUpdate = false;

    // private _needsStepsUpdate = false;

    updateSteps(){
        // this.setStepProgress(0, false)

        // this._scrollView?.shouldComponentUpdate?.call(this, this.props, this.state, this.context)
        //  this.setState({}, ()=>this.setStepProgress(0))

        
        // this._blockUpdate = true
        // this._currentOffset = 0
        // this._scrollView?.scrollTo({x:0, animated: false})
        // this.setState({}, () => this._blockUpdate = false)


        // this._needsStepsUpdate = true

        this.setCarouselState(CarouselState.isFinishing)
    }

    // setSteps(steps: Step[]){
    //     const idCollisionCheck = new Set()
    //     steps.forEach(step => idCollisionCheck.add(step.id));
    //     if(idCollisionCheck.size !== steps.length)
    //         throw 'id collision detected in provided Steps'
        
    // }

    // setStepProgress(progress: number, smoothed: boolean = true){
    //     // if( this._blockUpdate ) return

    //     // if( this._isBlockingProgressUpdateUntilRender ) return
    //     // const width = this.getState().width
    //     // if( width === 0 || this._isDragging ) return
    //     // const offsetX = progress * width

    //     // Animated.loop()

    //     // const targetOffset = progress * width
    //     // const currentOffset = this._currentOffset ?? 0
    //     // const offset = smoothed
    //     //     ? currentOffset + (targetOffset - currentOffset) * 0.1
    //     //     : targetOffset
    //     // this._currentOffset = offset;
    //     // console.log(currentOffset)

    //     // this._scrollView?.scrollTo({x:offset, animated: false})
    //     // this._isScrollAnimating = true;
    //     // if( currentOffset >= width ) this.props.onTriggeredNextStep?.call(this, this)

    //     this._stepProgress = progress
    // }

    // onUpdate(progress: number){
    //     const width = this.getState().width
    //     if( width === 0 || this._isDragging ) return
    //     const offsetX = progress * width
    //     this._scrollView?.scrollTo({x:offsetX, animated: true})
    //     // this._isScrollAnimating = true;
    //     if(offsetX >= width) this.onNext()
    // }

    

    componentDidMount(){
        const updateInterval = 33.333 // 30fps
        this._updateSubscription?.unsubscribe();
        this._updateSubscription = interval(updateInterval)
            .subscribe(() => this.onUpdate(updateInterval));
        // console.log('mount');
    }

    componentWillUnmount(){
        this._updateSubscription?.unsubscribe();
        this._updateSubscription = undefined;
    }

    private onUpdate(timeDelta: Milliseconds){
        const smoothingFactor = 0.009 // magic value adjusted for time delta which feels nice
        const width = this.getState().width
        if( width === 0 || this._isDragging ) return
        const targetOffset = this.getTargetOffset()
        const currentOffset = this._currentOffset ?? 0
        const offset = this._carouselState === CarouselState.isGoing
            ? currentOffset + (targetOffset - currentOffset) * timeDelta * smoothingFactor
            : targetOffset
        this._scrollView?.scrollTo({x:offset, animated: false})
        const threshold = 20

        if( this._carouselState !== CarouselState.isResetting && offset >= width - threshold ){
            this.setCarouselState( CarouselState.isResetting )
            // console.log(this._carouselState.toString());
        }else if( this._carouselState === CarouselState.isResetting && offset <= threshold ){
            this.setCarouselState( CarouselState.isGoing )
            this.setState({})
            // console.log(this._carouselState.toString());
        }
    }

    private getTargetOffset(): number{
        switch(this._carouselState){
            case CarouselState.isGoing:
                const progress = this.props.adapter.getStepProgress()
                return progress * this.getState().width

            case CarouselState.isFinishing:
            case CarouselState.isFinishingByUser:
                return this.getState().width

            case CarouselState.isResetting:
                return 0
        }
    }

    private getState(): State{
        return this.state as State;
    }

    private setCarouselState(state: CarouselState){
        //     switch(state){
        //         case CarouselState.isGoing:
        //             break;
        //         case CarouselState.isFinishing:
        //             break;
        //         case CarouselState.isResetting:
        //             break;
        //     }
        this._carouselState = state
    }

    private triggerNext(){
        this.props.onTriggeredNextStep?.call(this, this)
    }

    render(){
        // this._isBlockingProgressUpdateUntilRender = false
        // this._scrollView?.scrollTo({x:0, animated: false})
        // this.setStepProgress(this.props.adapter.getStepProgress())
        return <ScrollView
        horizontal={true}
        style={[this.props.style]}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        pagingEnabled={false}
        scrollEventThrottle={32}
        onScroll={event => {
            this._currentOffset = event.nativeEvent.contentOffset.x
        }}
        ref={view => this._scrollView = view}
        onScrollBeginDrag={(event)=>{
            this._isDragging = true;
        }}
        onScrollEndDrag={(event)=>{
            this._isDragging = false;
        }}
        // onScrollAnimationEnd={()=>{
        //     // this._isScrollAnimating = false;
        // }}
        // onMomentumScrollEnd={(event)=>{
        //     // if(this.state.width === 0 || this._isDragging || this._isScrollAnimating) return
        //     if(event.nativeEvent.contentOffset.x >= this.state.width) this.onNext()
        //     this._scrollView?.setNativeProps({pagingEnabled: false})
        //     this._scrollView?.scrollTo({x:0, animated: false})
        // }}
        onLayout={event => this.setState({width: event.nativeEvent.layout.width})}
        >
            {this.props.adapter.getCurrentStepView(this.getState().width)}
            {this.props.adapter.getNextStepView(this.getState().width)}
        </ScrollView>
    }
}



// export default function StepsCarousel(props: StepsCarouselProps){
//     const [width, setWidth] = useState(0)
//     let _scrollView:ScrollView|undefined;
//     var _isDragging = false;

//     function updateSteps(){
//         setState({})
//         setStepProgress(0)
//     }

//     function setStepProgress(progress: number){
//         if( width === 0 || _isDragging ) return
//         const offsetX = progress * width
//         _scrollView?.scrollTo({x:offsetX, animated: false})
//         if( offsetX >= width ) props.onTriggeredNextStep?.call(undefined, _scrollView)
//     }
    
//     return <ScrollView
//         horizontal={true}
//         style={props.style}
//         showsHorizontalScrollIndicator={false}
//         showsVerticalScrollIndicator={false}
//         scrollEnabled={true}
//         pagingEnabled={false}
//         onScroll={()=>{
//             if(this._test){
//                 this.setState({})
//                 this._test = false
//             }
//         }}
//         ref={view => this._scrollView = view}
//         onScrollBeginDrag={(event)=>{
//             this._isDragging = true;
//         }}
//         onScrollEndDrag={(event)=>{
//             this._isDragging = false;
//         }}
//         onLayout={event => setWidth(event.nativeEvent.layout.width)}
//         >
//             {props.adapter.getCurrentStepView(width)}
//             {props.adapter.getNextStepView(width)}
//     </ScrollView>
// }



export interface StepsCarouselAdapter{
    getCurrentStepView: (expectedWidth: number) => ReactElement
    getNextStepView: (expectedWidth: number) => ReactElement
    getStepProgress: () => number
}

export interface StepsCarouselProps extends ViewProps{
    adapter: StepsCarouselAdapter
    ref?: (carousel: StepsCarousel) => void
    onTriggeredNextStep?: (carousel: StepsCarousel) => void
}

export interface Step{
    // content: Component<ViewProps>,
    content: ReactElement
    id: string,
}

interface State{
    width: number
}
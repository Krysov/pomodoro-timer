import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { ViewProps, ScrollView } from "react-native";

export const StepsCarousel = (props: StepsCarouselProps) => {
    const adapter = props.adapter;
    const scrollView = useRef<ScrollView|null>(null);

    const [width, setWidth] = useState(props.style?.width ?? 0);
    const [offsetX, setOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [keyLeft, setKeyLeft] = useState(adapter.onFetchKeyCurrent?.());
    const [keyRight, setKeyRight] = useState(adapter.onFetchKeyFollowing?.());
    
    useEffect(()=>{
        if(!isDragging) scrollView.current?.scrollTo(
            {x: offsetX * width, animated: false});
    }, [width, offsetX, keyLeft, keyRight, isDragging]);
    useEffect(()=>{
        setIsDragging(false);
    }, [keyLeft, keyRight]);

    adapter.onUpdate = () => {
        setOffsetX(adapter.onFetchProgress?.() ?? 0);
        setKeyLeft(adapter.onFetchKeyCurrent?.());
        setKeyRight(adapter.onFetchKeyFollowing?.());
    };

    let isTriggeringMoveNext = (withOffsetX: number)=>{
        return (withOffsetX / 0.75) >= width;
    }
    
    return <ScrollView
        testID={'idCarousellScroll'}
        horizontal={true}
        style={props.style}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        pagingEnabled={false}
        ref={scrollView}
        onScrollBeginDrag={() => setIsDragging(true)}
        onScrollEndDrag={event => {
            setIsDragging(false);
            if(isTriggeringMoveNext(event.nativeEvent.contentOffset.x))
                adapter.onUserMovedNext?.(keyLeft, keyRight);
        }}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}>
            {adapter.getViewCurrent?.(width)}
            {adapter.getViewFollowing?.(width)}
        </ScrollView>;
};

export interface StepsCarouselProps extends ViewProps{
    adapter: StepsCarouselAdapter<any>;
}

export class StepsCarouselAdapter<ItemKey>{
    onCreateView?: (key: ItemKey, width: number) => ReactElement;
    onFetchKeyCurrent?: () => ItemKey;
    onFetchKeyFollowing?: () => ItemKey;
    onFetchProgress?: () => number;
    onUserMovedNext?: (keySkipped: ItemKey, keySelected: ItemKey) => void;
    onUpdate?: () => void;

    getViewCurrent(itemWidth: number): ReactElement|undefined {
        let key = this.onFetchKeyCurrent?.();
        return key ? this._getItemView(key, itemWidth) : undefined;
    }

    getViewFollowing(itemWidth: number): ReactElement|undefined {
        let key = this.onFetchKeyFollowing?.();
        return key ? this._getItemView(key, itemWidth) : undefined;
    }

    private _getItemView(key: ItemKey, itemWidth: number): ReactElement|undefined {
        return this.onCreateView?.(key, itemWidth);
    }

    update(){
        this.onUpdate?.();
    }
}

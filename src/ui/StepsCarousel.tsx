import React, { LegacyRef, ReactElement, useEffect, useRef, useState } from 'react';
import { ViewProps, ScrollView, View } from "react-native";

export const Carousel = (props: CarouselProps) => {
    const adapter = props.adapter;
    const scrollView = useRef<ScrollView|null>(null);

    const [width, setWidth] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [keyLeft, setKeyLeft] = useState(adapter.onFetchKeyCurrent?.());
    const [keyRight, setKeyRight] = useState(adapter.onFetchKeyFollowing?.());
    
    useEffect(()=>{
        scrollView.current?.scrollTo({x:offsetX * width, animated: false})
    }, [width, offsetX, keyLeft, keyRight])
    adapter.onUpdate = () => {
        setOffsetX(adapter.onFetchProgress?.() ?? 0);
        setKeyLeft(adapter.onFetchKeyCurrent?.());
        setKeyRight(adapter.onFetchKeyFollowing?.());
    };
    
    return <ScrollView
        horizontal={true}
        style={props.style}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        pagingEnabled={false}
        ref={scrollView}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
        >
            {adapter.getViewCurrent?.(width)}
            {adapter.getViewFollowing?.(width)}
        </ScrollView>;
};

export interface CarouselProps extends ViewProps{
    adapter: CarouselAdapter<any>;
}

export class CarouselAdapter<ItemKey>{
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

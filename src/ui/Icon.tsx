import React from 'react';
import { Icon, IconProps } from 'react-native-elements';
import { View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary'

export default class IconWrapper extends React.Component<IconProps> {
    readonly fallback = (props: { error: Error, resetError: Function }) => <View/>
    render() {
        return <ErrorBoundary onError={()=>{}} FallbackComponent={this.fallback}>
            <Icon {...this.props}/>
        </ErrorBoundary>
    }
}
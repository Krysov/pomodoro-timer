import React, { Component } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import WebView from 'react-native-webview';

export default class WasmRunner extends Component<WasmRunnerProps> {
    constructor(props: WasmRunnerProps){
        super(props);
        this.state = {jsWasmScript: ''};
    }

    async run(wasmResource: any, functionName: string, args: [...any] = []){
        this.loadBlobResource(wasmResource, base64 => {
            const argString = JSON.stringify(args).slice(1, -1); // cut the brackets
            const script = this.getRunnerScript(base64, functionName, argString, 1024);
            // console.log(script);
            this.setState({jsWasmScript: script});
        });
    }

    private async loadBlobResource(wasm: any, result: (base64: string) => void){
        const path = await Image.resolveAssetSource(wasm as ImageSourcePropType).uri;
        const fetchPromise = await fetch(path);
        const blob = await fetchPromise.blob();
        const reader = new FileReader();
        reader.onload = async function(event) {
            if(!reader.result) throw new Error('Unable to load WASM code!');
            const dataDescriptor = 'data:application/octet-stream;base64,';
            let data = reader.result?.toString();
            if( data.startsWith(dataDescriptor) )
                data = data.slice(dataDescriptor.length);
            result(data);
        };
        await reader.readAsDataURL(blob);
    }

    private getRunnerScript(wasmBase64: string, functionName: string, argString: string, outBufferSize: number): string{
        return`
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            const lookup = new Uint8Array(256);
            for (let i = 0; i < chars.length; i++) {
                lookup[chars.charCodeAt(i)] = i;
            }
            function decode(base64) {
                var bufferLength = base64.length * 0.75,
                    len = base64.length, i, p = 0,
                    encoded1, encoded2, encoded3, encoded4;
                if (base64[base64.length - 1] === '=') {
                    bufferLength--;
                    if (base64[base64.length - 2] === '=') {
                    bufferLength--;
                    }
                }
                var arraybuffer = new ArrayBuffer(bufferLength),
                    bytes = new Uint8Array(arraybuffer);
                for (i = 0; i < len; i+=4) {
                    encoded1 = lookup[base64.charCodeAt(i)];
                    encoded2 = lookup[base64.charCodeAt(i+1)];
                    encoded3 = lookup[base64.charCodeAt(i+2)];
                    encoded4 = lookup[base64.charCodeAt(i+3)];
                    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
                }
                return arraybuffer;
            }
            const code = '`+wasmBase64+`'
            const wasm = decode(code);
            WebAssembly.compile(wasm)
            .then(module => WebAssembly.instantiate(module))
            .then(instance => {
            	const linearMemory = instance.exports.memory;
            	const offset = instance.exports.`+functionName+`(`+argString+`);
                const stringBuffer = new Uint8Array(linearMemory.buffer, offset, `+outBufferSize+`);
              	let str = '';
                for (let i=0; i<stringBuffer.length; i++) {
                  str += String.fromCharCode(stringBuffer[i]);
                }
                sendBack(str);
            })
            .catch((err) => { 
                sendBack(err.message)
            });
            function sendBack(msg){
                console.log(msg);
                window.ReactNativeWebView.postMessage(JSON.stringify(msg));
            }`
    }
            
    componentDidMount(){
        this.props.onRef?.call(this, this);
    }

    render(){
        return <View style={{ height: 500, width: 500, flex:1, backgroundColor:'#333' }}>
            <WebView
            useWebkit={true}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            allowFileAccess={true}
            cacheEnabled={false}
            // onError={msg => console.log(msg)}
            onMessage={msg => console.log(msg.nativeEvent.data)}
            mixedContentMode={'compatibility'}
            // source={{html: '<meta charset="UTF-8"><HTML><BODY></BODY></HTML>'}}
            injectedJavaScript={(this.state as any).jsWasmScript}
            // onMessage={msg => this.props.onResult?.call(this, JSON.parse(msg.nativeEvent.data)['result'])}
        />
        </View>
    }
}

interface WasmRunnerProps{
    onRef?: (ref: WasmRunner) => void;
    onResult?: (result: any) => void;
}
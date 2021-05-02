import React from 'react';
import { PixelRatio } from 'react-native';
import { captureRef, releaseCapture } from "react-native-view-shot";
import chalk from 'chalk';
import { parseToRgba } from 'color2k';
import png from "./png-parsing/png-parser";

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchPixels(expected: CaptureExpectation, threshold?: number): Promise<CustomMatcherResult>
        }
    }
}

expect.extend({
    async toMatchPixels(received: React.Component, expected: CaptureExpectation, threshold = 8): Promise<jest.CustomMatcherResult> {
        const {width: expectedWidth, height: expectedHeight} = getRectArraySize(expected);
        const captureUri = await captureRef(received, {
            format: 'png',
            result: 'tmpfile',
            width: expectedWidth / PixelRatio.get(),
            height: expectedHeight / PixelRatio.get(),
        });
        const data = await png.load(captureUri);
        const receivedWidth = data.header.width;
        const receivedHeight = data.header.height;
        const rgbaBufferReceived = data.pixels as NamedPixel[][];
        releaseCapture(captureUri);
        const checkValidColor = new RegExp('^#?([0-9a-f]{2}|xx([0-9a-f]{2}|xx)([0-9a-f]{2}|xx)([0-9a-f]{2}|xx)?|[0-9a-fx]{3,4})$');
        const checkUndefR = new RegExp('(?=^#?([0-9a-fx]{6}|[0-9a-fx]{8})$)#?.{0}xx|(?=^#?([0-9a-fx]{3}|[0-9a-fx]{4})$)#?.{0}x');
        const checkUndefG = new RegExp('(?=^#?([0-9a-fx]{6}|[0-9a-fx]{8})$)#?.{2}xx|(?=^#?([0-9a-fx]{3}|[0-9a-fx]{4})$)#?.{1}x');
        const checkUndefB = new RegExp('(?=^#?([0-9a-fx]{6}|[0-9a-fx]{8})$)#?.{4}xx|(?=^#?([0-9a-fx]{3}|[0-9a-fx]{4})$)#?.{2}x');
        const checkUndefA = new RegExp('(?=^#?[0-9a-fx]{8}$)#?.{6}xx|(?=^#?[0-9a-fx]{4}$)#?.{3}x');
        let pass
            = receivedWidth === expectedWidth
            && receivedHeight === expectedHeight;
        const rgbaBufferExpected = new Array(expectedWidth);
        for(let y = 0; y < expectedWidth; y++){
            rgbaBufferExpected[y] = new Array(expectedHeight);
            for(let x = 0; x < expectedHeight; x++){
                const expectedColor = expected[y][x];
                if( !checkValidColor.test(expectedColor) ) throw 'Invalid color input: ' + expectedColor;
                const ignoreR = checkUndefR.test(expectedColor);
                const ignoreG = checkUndefG.test(expectedColor);
                const ignoreB = checkUndefB.test(expectedColor);
                const ignoreA = checkUndefA.test(expectedColor);
                const [eR, eG, eB, eA] = parseToRgba(expectedColor.replaceAll('x', '0'));
                rgbaBufferExpected[y][x] = {eR, eG, eB, eA}
                const receivedPixel = rgbaBufferReceived[y][x];
                if( receivedPixel ){
                    const {r:rR, g:rG, b:rB, a:rA} = receivedPixel;
                    if(!ignoreR && !matches(eR, rR, threshold)) pass = false;
                    if(!ignoreG && !matches(eG, rG, threshold)) pass = false;
                    if(!ignoreB && !matches(eB, rB, threshold)) pass = false;
                    if(!ignoreA && !matches(eA, rA, threshold)) pass = false;
                    // let the loop continue regardless so full images can be logged
                }
            }
        }
        const message = () => pass ? '' : 'Captured:'
            +'\n'+getPrintableImage(rgbaBufferReceived)
            +'\nExpected:'
            +'\n'+getPrintableImage(rgbaBufferExpected);
        return { message, pass };
    },
});

function matches(a:number, b:number, threshold:number): boolean{
    return a >= b - threshold && a <= b + threshold;
}

function getPrintableImage(rgbaBuffer: NamedPixel[][]): string{
    if( rgbaBuffer.length === 0 ) return 'Empty Image';
    const { width, height } = getRectArraySize(rgbaBuffer);
    let result = '';
    for( let y = 0; y < height; y++ ){
        if( y>0 ) result += '\n';
        for( let x = 0; x < width; x++ ){
            for( let z = 0; z < 2; z++ ){
                result += getPixelChar(rgbaBuffer[y][x]);
            }
            // result += ' ';
        }
    }
    return result;
}

function getRectArraySize(rectArray: any[][]): {width: number, height: number}{
    const height = rectArray.length;
    const width = rectArray[0].length;
    for(let i = 1; i < height; ++i){
        if(rectArray[i].length !== width) throw 'Row length mismatch!'
    }
    return {width, height}
}

function getPixelChar(pixel: NamedPixel): string {
    if( !pixel ) return '?'
    const {r, g, b, a} = pixel;
    const charSet = ':░▒▓█';
    const char = charSet[Math.round(Math.min(255, Math.max(0, a)) / 64.)];
    return chalk.rgb(
        Math.min(255, Math.max(0, r)),
        Math.min(255, Math.max(0, g)),
        Math.min(255, Math.max(0, b)))
        .bold(char);
}

type NamedPixel = {
    'r': number,
    'g': number,
    'b': number,
    'a': number,
}

type CaptureExpectation = string[][];




// const handleCanvas = (canvas: Canvas) => {
//   // console.log(canvas);
//   const width = 8;
//   const height = 8;
//   const ctx = canvas.getContext('2d');
//   canvas.width = width;
//   canvas.height = height;
//   const img = new CanvasImage(canvas);
  
//   img.crossOrigin = "anonymous";  // This enables CORS
//   img.src = "https://i.stack.imgur.com/deYFH.jpg";
//   img.crossOrigin = "";  // This enables CORS
//   // console.log( Image.resolveAssetSource(ThisDude).uri );
//   // console.log(img.src);
//   console.log('src set');
//   (img as any).onload = () => {
//   // }
//   // img.addEventListener('load', () => {
//     // try {
//       console.log('draw image');
//       ctx.drawImage(img, 0, 0, width, height);
//       // console.log(ctx);
//       // console.log(img);
//       console.log('get image');
//       ctx.getImageData(0, 0, width, height).then(imgd => {
//         const pix = imgd.data;
//         const outBuf = new Array(pix.length);
//         for (var i = 0, n = pix.length; i < n; i += 4) {
//             outBuf[i  ] = pix[i  ]
//             outBuf[i+1] = pix[i+1]
//             outBuf[i+2] = pix[i+2]
//             outBuf[i+3] = pix[i+3]
//         }
//         // console.log(pix.length);
//         drawPrettyColors(outBuf, width, height);
//       })
//     // } catch (e) {
//     //   alert(e);
//     // }
//   }
// };




// return <View testID='welcome'>
//     <ViewShot
//       captureMode='mount'
//       onCapture={onCapture}
//       onCaptureFailure={e => console.log(e)}
//       options={{format:'png', width:32/PixelRatio.get(), height: 32/PixelRatio.get(), result: 'tmpfile'}}>
//       <StepsCarousel style={styles.stateStepper}
//         adapter={stepsAdapter}
//         ref={carousel => statesCarousel = carousel}
//         onTriggeredNextStep={carousel => {}}
//       />
//       {/* <Image source={require('./app/assets/ThisDude.png')}/> */}
//     </ViewShot>
//     <View>
//       {/* <Canvas ref={handleCanvas} style={{width:8, height:8}}/> */}
//     </View>
//   </View>






// let onCapture = async (capturedImageUri: string) => {
    
    // const rgb2hex = (rgb:string) => {
    //   return (rgb && rgb.length === 3) ? '#' +
    //       ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) +
    //       ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    //       ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2) : '';
    // };
    
    // const pixelColor = Platform.OS === 'ios' ? NativeModules.RNPixelColor : NativeModules.GetPixelColor;
    // resolveModuleName(rgb2hex(color).toUpperCase());





    // Image.getSize(capturedImageUri,
    //   (w, h) => {
    //     fillPxlBufFrom(capturedImageUri, w, h, buf => drawPrettyColors(buf, w, h));
    //   },
    //   err=>console.log(err));





    // fetch(capturedImageUri).then(async image=>{
    //     const blob = await image.blob();
    //     const reader = new FileReader();
    //     reader.onload = async function(event) {
    //         if(!reader.result) throw new Error('Unable to load captured PNG!');
    //         const dataDescriptor = 'data:image/png;base64,';
    //         let data = reader.result?.toString();
    //         if( data.startsWith(dataDescriptor) )
    //             data = data.slice(dataDescriptor.length);
    //     };
    //     reader.readAsDataURL(blob);
    //   releaseCapture(capturedImageUri)
    // });



    // console.log(png);
    // await png.load(capturedImageUri)
    //   .then((data:any)=>{
    //     const width = data.header.width;
    //     const height = data.header.height;
    //     const pixels = [...data.pixels] as Array<number|any>;
    //     drawPrettyColors(pixels, width, height);
    //   })
    //   .catch(console.error);
  // }




  // function fillPxlBufFrom(uri: string, width: number, height: number, onDone: (outBuf: Array<number>)=>void){
  //   setImage(uri)
  //   .then(() => {
  //     const outBuf = new Array(width * height * 4);
  //     fillPxlBufRecursively(0, outBuf, () => onDone(outBuf));
  //   })
  //   .catch((err: any) => console.log(err));
  // }

  // function fillPxlBufRecursively(i: number, outBuf: Array<number>, onDone: ()=>void){
  //   pickColorAt(0, 0)
  //     .then((color: string) => {
  //       const pxl = parseToRgba(color);
  //       outBuf[i  ] = pxl[0];
  //       outBuf[i+1] = pxl[1];
  //       outBuf[i+2] = pxl[2];
  //       outBuf[i+3] = pxl[3];
  //       if( i < outBuf.length/4 ) fillPxlBufRecursively(i+4, outBuf, onDone);
  //       else onDone();
  //     })
  //     .catch((err: any) => console.log(err));
  // }

  


 
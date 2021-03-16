extern crate wasm_bindgen;
extern crate image;
extern crate base64;
use wasm_bindgen::prelude::*;
use image::imageops::FilterType::Nearest;
// use serde::{Serialize, Deserialize};
// use serde_json::{Result, Value};
use std::ffi::CString;
// use std::iter::Iterator;
use std::path::Path;
// use std::os::raw::c_char;
use std::fs::File;
use std::io::prelude::*;
use std::io::BufReader;

use base64::{encode, decode};


// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[no_mangle]
pub fn get_hello() -> *mut u8 {
    let c = vec!['a','b','c','d',];
    let result: Vec<u8> = (0..1024).map(|n| c[n%4] as u8).collect();
    return CString::new(result).unwrap().into_raw() as *mut u8;
}

// pub fn load_png_as_testable(file_location: &str, target_width: u32, target_height: u32) -> Result<Vec<u8>, Error> {
#[wasm_bindgen]
#[no_mangle]
pub fn load_png_as_testable(base64_png_file: &str, target_width: u32, target_height: u32) -> *mut u8 {
    // let img1 = ImageReader::open(&file_location)?.decode()?;    
    // let path = Path::new("/Users/k/Library/Developer/CoreSimulator/Devices/A6FFE187-BB53-4C75-9A5C-1FFC34BE7EA2/data/Containers/Data/Application/E231CB7E-F1D5-4E75-9587-E5FA595D99CC/tmp/ReactNative/C1390ABA-3980-4556-9E49-7EDA99E8DCA1.png");
    
    
    // let img = image::load_from_memory(&decode(base64_png_file).unwrap())
    //     .unwrap()
    //     .resize_exact(target_width, target_height, Nearest)
    //     .to_rgba8();

    // let from: &str = "/Users/k/Library/Developer/CoreSimulator/Devices/A6FFE187-BB53-4C75-9A5C-1FFC34BE7EA2/data/Containers/Data/Application/E231CB7E-F1D5-4E75-9587-E5FA595D99CC/tmp/ReactNative/C1390ABA-3980-4556-9E49-7EDA99E8DCA1.png";
    // let into: &str = "/Users/k/Library/Developer/CoreSimulator/Devices/A6FFE187-BB53-4C75-9A5C-1FFC34BE7EA2/data/Containers/Data/Application/E231CB7E-F1D5-4E75-9587-E5FA595D99CC/tmp/ReactNative/C1390ABA-3980-4556-9E49-7EDA99E8DCA1.png";
    
    // let im = image::open(&Path::new(&from))
    //     .expect("msg: &str")
    //     .resize_exact(target_width, target_height, Nearest);

    // Write the contents of this image using extension guessing.
    // im.save(&Path::new(&into)).unwrap();
    // let mut file = File::open(from).unwrap();
    // let mut buf_reader = BufReader::new(file);
    // let mut contents = String::new();
    // buf_reader.read_to_string(&mut contents)?;


    
    // let img = image::open(&Path::new(&"/Users/k/Library/Developer/CoreSimulator/Devices/A6FFE187-BB53-4C75-9A5C-1FFC34BE7EA2/data/Containers/Data/Application/E231CB7E-F1D5-4E75-9587-E5FA595D99CC/tmp/ReactNative/C1390ABA-3980-4556-9E49-7EDA99E8DCA1.png"))
    // .unwrap();
    // let img = image::open(path)
        // .expect(&format!("{}{}", "Failed to load PNG at: ", &file_location))
        // .expect(&format!("{}", "Failed to load PNG at: "));
        // .resize_exact(target_width, target_height, Nearest)
        // .to_rgba8();
    // let num_pxl = target_width * target_height;
    // let len_pxl_buffer = num_pxl * 4;
    // let mut pxl_out_buffer: Vec<u8> = vec!['x' as u8; len_pxl_buffer as usize];
    // (0..100).map(|i| (0..3).map(|j| img.get_pixel(i%target_width, i/target_width)[j])).collect();
    // let i: usize;
    // let pxl: &image::Rgba<u8>;
    // for y in 0..target_height { for x in 0..target_width {
    //     // let pxl = img.get_pixel(x, y);
    //     let i = (y * target_width + x) as usize;
    //     // pxl_out_buffer[i*4+0] = pxl[0];
    //     // pxl_out_buffer[i*4+1] = pxl[1];
    //     // pxl_out_buffer[i*4+2] = pxl[2];
    //     // pxl_out_buffer[i*4+3] = pxl[3];

    //     // pxl_out_buffer[i*4+0] = 'a' as u8;
    //     // pxl_out_buffer[i*4+1] = 'b' as u8;
    //     // pxl_out_buffer[i*4+3] = 'c' as u8;
    //     // pxl_out_buffer[i*4+2] = 'd' as u8;
    // };};

    // (0..target_width-1).for_each(|j| pxl_out_buffer[j as usize] = 'a' as u8);
    // (target_width..target_width+target_height-1).for_each(|j| pxl_out_buffer[j as usize] = 'b' as u8);

    
    let result: Vec<u8> = (0..256)
        // .map(|i| get_col_channel_val_at(i, target_width as usize, target_height as usize))
        .map(|i| base64_png_file.as_bytes()[i])
        .collect();
    return CString::new(result)
        .unwrap()
        .into_raw()
        as *mut u8;
}

fn get_col_channel_val_at(i: usize, img_w: usize, img_h: usize) -> u8{
    let c = vec!['y','o','l','o',];
    return c[i%4] as u8;
}

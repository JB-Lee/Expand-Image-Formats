# [Expand Image Formats](https://github.com/MeteorClear/Expand-Image-Formats)

## Overview
This Chrome extension is an improved version of the previously developed **Allow WebP**. It allows you to use image formats that are not natively supported by Google Docs/Slides/Sheets without the need for manual conversion to supported formats like GIF, PNG, or JPEG. You can insert unsupported images seamlessly.


## Supported Image Formats
- **WebP** (.webp)  
- **BMP** (.bmp)  
- **SVG** (.svg)  
- **AVIF** (.avif)  


## Usage

### Google Docs and Google Slides  
Simply drag and drop the file onto your document or slide to insert it.

### Google Sheets  
Copy the file(e.g., `Ctrl + C`), click a cell, and paste it(e.g., `Ctrl + V`).

> **Note1:**  
> Uploading images via the **Insert tab is not supported** due to technical limitations. While this may feel unintuitive or inconvenient, it is currently the most effective method available. Thank you for your understanding.  

> **Note2:**
> This extension is designed with the intention of supporting multiple file insertions at once. However, it does not currently work as expected with **Google Sheets**. Unfortunately, you will need to **copy and paste files one at a time**. I am actively exploring various solutions to address this issue.


## Installation

### Installation via Chrome Web Store  
1. Open the [Chrome Web Store link for this extension](https://chromewebstore.google.com/detail/expand-image-formats/bcdfbjbdmdcijfoombbllikkjlpmnikk).  
2. Click **Add to Chrome**.

### Manual Installation  
1. Clone this repository or download it as a ZIP file.  
2. Open Chrome and navigate to `chrome://extensions/`. You can also find this via **Settings > Extensions**.  
3. Enable **Developer mode** in the top-right corner.  
4. Click **Load unpacked** and select the folder containing the extension files (the folder should contain the manifest.json file).


## How It Works  
This extension works by converting unsupported image formats into supported ones and inserting them automatically. 
Currently, images are converted to **PNG** format for the following reasons:  
- GIF has limited color support.  
- JPEG does not support alpha transparency.  

### Detailed Process  
1. When an image insertion event occurs, the extension extracts the file data. (The lack of explicit events for uploads is why this extension doesn’t support the **Insert** tab.)  
2. It identifies and filters out unsupported but convertible image formats.  
3. The filtered images are converted into a supported format (PNG).  
4. A new insertion event is generated using the converted image data, mimicking the original event’s position and target.  
5. The new event is triggered, inserting the converted image seamlessly.

> **Note:**  
> While SVG is supported, the process rasterizes the vector image. This means the inserted SVG image will no longer behave as a scalable vector but as a rasterized image, potentially causing pixelation or quality loss when resized.  
> Currently, the logic converts SVG images to a minimum size, which may result in smaller images than intended. I am actively exploring solutions to address this issue.


## Privacy Policy  
This extension does not communicate with external servers, store data, or transmit information. All conversions occur locally within the extension itself, ensuring full offline functionality.


## Future Development  
- **Alternative Insertion Methods**: Exploring other ways to support image insertion, though technical constraints make this challenging.  
- **HEIF Format Support**: Considering adding HEIF support, but decoding HEIF files in a browser environment may require significant optimization.  
- **DDS and TIFF Support**: These formats are commonly used in specific fields and are under consideration for future support.
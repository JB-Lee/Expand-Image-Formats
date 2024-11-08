//console.log("content.js load")

// Register event listeners for drag-and-drop and paste events
document.addEventListener('drop', handleEvent);
document.addEventListener('paste', handleEvent);

// Supported image MIME type list
const supportedImageTypes = ['image/webp', 'image/bmp', 'image/svg+xml', 'image/avif'];

/**
 * Handle events and filtering for supported image types.
 *
 * @param {Event} event - The drop or paste event object.
 */
async function handleEvent(event) {
    //console.log("event occurred :", event.type, event);

    if (event.type === 'paste' && !event.clipboardData) {
        console.error("Clipboard data is null or undefined.");
        return;
    }

    const items = (
            (event.type === 'drop') ? 
                event.dataTransfer.items : 
            (event.type === 'paste') ? 
                event.clipboardData.items : null
    );

    if (items == null) {
        console.error("Undefined event.");
        return;
    }
    
    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && supportedImageTypes.includes(items[i].type)) {
            if (imageFiles.length === 0) event.preventDefault();
            if (items[i].type === 'image/avif' && window.location.href.startsWith('https://docs.google.com/document/')) continue;

            const file = items[i].getAsFile();
            imageFiles.push(file);
        }
    }

    if (imageFiles.length > 0) {
        const dataTransfer = await convertDataTransfer(imageFiles);

        const newEvent = createNewEvent(dataTransfer, event);
        
        if (newEvent){
            dispatchNewEvent(newEvent);
        }
    }
}


/**
 * Convert the array of image files to PNG format.
 * Then them to a DataTransfer object.
 *
 * @param {File[]} files - Array of files to process.
 * @returns {DataTransfer} - The DataTransfer object containing the converted files.
 */
async function convertDataTransfer(files) {
    //console.log("process call:", event.type, file);
    const dataTransfer = new DataTransfer();

    for (const file of files) {
        const dataURL = await readFile(file);
        const img = await loadImage(dataURL);

        const pngBlob = await convertImage2PNGBlob(img);
        const pngFile = new File([pngBlob], file.name.replace(/\.\w+$/, '.png'), { type: 'image/png' });

        dataTransfer.items.add(pngFile);
    }

    return dataTransfer;
}


/**
 * Create a new drop or paste event with the modified DataTransfer object.
 *
 * @param {DataTransfer} dataTransfer - The DataTransfer object to attach to the new event.
 * @param {Event} originalEvent - The original event to copy properties from.
 * @returns {Event | null} - A new drop or paste event, or null if event type is unsupported.
 */
function createNewEvent(dataTransfer, originalEvent) {
    if (originalEvent.type === 'drop') {
        return createNewDropEvent(dataTransfer, originalEvent);
    } else if (originalEvent.type === 'paste') {
        return createNewPasteEvent(dataTransfer, originalEvent);
    }
    return null
}


/**
 * Read the given file and return its data URL as a string.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<string>} The promise that resolves with the data URL of the file.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/**
 * Load the image from the given data URL.
 *
 * @param {string} dataURL - The data URL of the image.
 * @returns {Promise<HTMLImageElement>} The promise that resolves with the loaded image.
 */
function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataURL;
    });
}


/**
 * Convert the image element to the PNG blob.
 *
 * @param {HTMLImageElement} image - The image element to convert.
 * @returns {Promise<Blob>} The promise that resolves with the PNG blob.
 */
function convertImage2PNGBlob(image) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}


/**
 * Create the new drop event with the given DataTransfer and original event properties.
 *
 * @param {DataTransfer} dataTransfer - The DataTransfer object to attach to the new event.
 * @param {DragEvent} originalEvent - The original drop event.
 * @returns {DragEvent} The newly created drop event.
 */
function createNewDropEvent(dataTransfer, originalEvent) {
    const newEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
        screenX: originalEvent.screenX,
        screenY: originalEvent.screenY,
        dataTransfer: dataTransfer,
        sourceCapabilities: originalEvent.sourceCapabilities
    });

    Object.defineProperty(newEvent, 'srcElement', { value: originalEvent.srcElement });
    Object.defineProperty(newEvent, 'target', { value: originalEvent.target });

    newEvent.dataTransfer.dropEffect = originalEvent.dataTransfer.dropEffect;
    newEvent.dataTransfer.effectAllowed = originalEvent.dataTransfer.effectAllowed;

    return newEvent;
}


/**
 * Create the new paste event with the given DataTransfer and original event properties.
 *
 * @param {DataTransfer} dataTransfer - The DataTransfer object to attach to the new event.
 * @param {ClipboardEvent} originalEvent - The original paste event.
 * @returns {ClipboardEvent} The newly created paste event.
 */
function createNewPasteEvent(dataTransfer, originalEvent) {
    const newEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
        composed: true
    });

    Object.defineProperty(newEvent, 'srcElement', { value: originalEvent.srcElement });
    Object.defineProperty(newEvent, 'target', { value: originalEvent.target });
    Object.defineProperty(newEvent, 'currentTarget', { value: originalEvent.currentTarget });

    newEvent.clipboardData.dropEffect = 'none';
    newEvent.clipboardData.effectAllowed = 'uninitialized';

    return newEvent;
}


/**
 * Dispatch the new event to the target element.
 *
 * @param {Event} event - The event to dispatch.
 */
function dispatchNewEvent(event) {
    const targetElement = (
            (event.type === 'drop') ? 
                document.elementFromPoint(event.clientX, event.clientY) :
            (event.type === 'paste' ? 
                document.activeElement : null
    ));

    if (targetElement) {
        targetElement.dispatchEvent(event);
    } else {
        console.error("Failed to dispatch event: Undefined target element.");
    }
}

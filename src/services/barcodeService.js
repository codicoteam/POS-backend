const bwipjs = require('bwip-js');

/**
 * Generate barcode image as PNG buffer
 * @param {string} value - The value to encode in the barcode
 * @param {string} format - Barcode format (default: 'code128')
 * @returns {Promise<Buffer>} PNG image buffer
 */
exports.generateBarcode = async (value, format = 'code128') => {
  try {
    if (!value) {
      throw new Error('Barcode value is required');
    }

    const png = await bwipjs.toBuffer({
      bcid: format,           // Barcode type
      text: String(value),    // The data to encode
      scale: 3,               // 3x scale
      height: 10,             // Height in millimeters
      includetext: true,      // Show readable text
      textxalign: 'center',   // Center align text
    });

    return png;
  } catch (err) {
    throw new Error(`Barcode generation failed: ${err.message}`);
  }
};

/**
 * Generate barcode as SVG string
 * @param {string} value - The value to encode
 * @param {string} format - Barcode format (default: 'code128')
 * @returns {Promise<string>} SVG string
 */
exports.generateBarcodeSvg = async (value, format = 'code128') => {
  try {
    if (!value) {
      throw new Error('Barcode value is required');
    }

    const svg = await bwipjs.toSVG({
      bcid: format,
      text: String(value),
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });

    return svg;
  } catch (err) {
    throw new Error(`Barcode generation failed: ${err.message}`);
  }
};

/**
 * Generate barcode Data URL (base64 encoded PNG)
 * @param {string} value - The value to encode
 * @param {string} format - Barcode format (default: 'code128')
 * @returns {Promise<string>} Data URL
 */
exports.generateBarcodeDataUrl = async (value, format = 'code128') => {
  try {
    const png = await exports.generateBarcode(value, format);
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    return dataUrl;
  } catch (err) {
    throw new Error(`Data URL generation failed: ${err.message}`);
  }
};

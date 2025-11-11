const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');

class ImageCompositeService {
  /**
   * Composite product image with design overlay
   * @param {Object} params - Composite parameters
   * @param {string} params.productImageUrl - URL or path to product image
   * @param {string} params.designImageUrl - URL or path to design image
   * @param {Object} params.position - Design position {x: number, y: number} in percentage
   * @param {number} params.size - Design size in pixels
   * @param {string} params.outputFilename - Output filename
   * @returns {Promise<string>} - Path to composited image
   */
  async compositeImage({ productImageUrl, designImageUrl, position, size, outputFilename }) {
    try {
      // Download or read product image
      const productBuffer = await this.getImageBuffer(productImageUrl);
      
      // Download or read design image
      const designBuffer = await this.getImageBuffer(designImageUrl);
      
      // Get product image metadata
      const productMeta = await sharp(productBuffer).metadata();
      const productWidth = productMeta.width;
      const productHeight = productMeta.height;
      
      // Resize design to specified size first to get actual dimensions
      const resizedDesign = await sharp(designBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();
      
      // Get resized design dimensions
      const designMeta = await sharp(resizedDesign).metadata();
      const designWidth = designMeta.width;
      const designHeight = designMeta.height;
      
      // Calculate design position in pixels (centered at the position)
      // Frontend uses transform: translate(-50%, -50%) to center the design
      const centerX = Math.round((position.x / 100) * productWidth);
      const centerY = Math.round((position.y / 100) * productHeight);
      
      // Calculate top-left position to center the design
      const designX = Math.round(centerX - (designWidth / 2));
      const designY = Math.round(centerY - (designHeight / 2));
      
      // Composite design onto product
      const outputPath = path.join(__dirname, '../../uploads', outputFilename);
      
      await sharp(productBuffer)
        .composite([{
          input: resizedDesign,
          top: designY,
          left: designX
        }])
        .toFile(outputPath);
      
      return `/uploads/${outputFilename}`;
    } catch (error) {
      console.error('Image composite error:', error);
      throw error;
    }
  }
  
  /**
   * Get image buffer from URL or local path
   */
  async getImageBuffer(imageUrl) {
    // Check if it's a URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    }
    
    // Local path
    const localPath = imageUrl.startsWith('/uploads')
      ? path.join(__dirname, '../../uploads', path.basename(imageUrl))
      : imageUrl;
    
    return await fs.readFile(localPath);
  }
  
  /**
   * Create composite images for customized product
   * @param {Object} customization - Customization data
   * @param {string} productId - Product ID for filename
   * @returns {Promise<Object>} - Object with frontImageUrl and backImageUrl
   */
  async createCustomizationImages(customization, productImages, productId) {
    const result = {};
    const timestamp = Date.now();
    
    // Composite front view if design exists
    if (customization.frontDesign && customization.frontDesignPos) {
      const frontSize = customization.frontDesignSize && customization.frontDesignSize > 0 
        ? customization.frontDesignSize 
        : 200;
      const frontFilename = `composite-front-${productId}-${timestamp}.png`;
      result.frontImageUrl = await this.compositeImage({
        productImageUrl: productImages.front,
        designImageUrl: customization.frontDesignImageUrl,
        position: customization.frontDesignPos,
        size: frontSize,
        outputFilename: frontFilename
      });
    }
    
    // Composite back view if design exists
    if (customization.backDesign && customization.backDesignPos) {
      const backSize = customization.backDesignSize && customization.backDesignSize > 0 
        ? customization.backDesignSize 
        : 200;
      const backFilename = `composite-back-${productId}-${timestamp}.png`;
      result.backImageUrl = await this.compositeImage({
        productImageUrl: productImages.back,
        designImageUrl: customization.backDesignImageUrl,
        position: customization.backDesignPos,
        size: backSize,
        outputFilename: backFilename
      });
    }
    
    return result;
  }
}

module.exports = new ImageCompositeService();

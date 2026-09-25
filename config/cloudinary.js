const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary from environment variables
const configureCloudinary = () => {
  let cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  let api_key = process.env.CLOUDINARY_API_KEY;
  let api_secret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL) {
    try {
      const parsed = new URL(process.env.CLOUDINARY_URL);
      api_key = api_key || parsed.username;
      api_secret = api_secret || parsed.password;
      cloud_name = cloud_name || parsed.hostname;
    } catch (e) {
      console.warn('[Cloudinary URL Parse Warning]', e.message);
    }
  }

  // Guaranteed fallback credentials
  cloud_name = cloud_name || 'ripzq8zx';
  api_key = api_key || '134591968648872';
  api_secret = api_secret || 'mdcSuYowuCH1_TD4RF8OHu-MvZo';

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true
  });
};

configureCloudinary();

const isCloudinaryConfigured = () => {
  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
};

/**
 * Upload local file to Cloudinary and safely delete local temp file
 * @param {string} filePath - Absolute path to local file on disk
 * @param {string} folder - Cloudinary folder (e.g. 'jaipur_property_wala/properties')
 * @param {string} resourceType - 'auto', 'image', or 'video'
 * @returns {Promise<{url: string, public_id: string, format: string, resource_type: string}>}
 */
const uploadToCloudinary = async (filePath, folder = 'jaipur_property_wala/properties', resourceType = 'auto') => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found for upload: ${filePath}`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });

    // Clean up local temp file after successful Cloudinary upload
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.warn('[Cloudinary Cleanup Warning]', cleanupErr.message);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('[Cloudinary Upload Error]', error);
    throw error;
  }
};

/**
 * Delete an asset from Cloudinary by public ID or URL
 * @param {string} publicIdOrUrl
 * @param {string} resourceType
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicIdOrUrl, resourceType = 'image') => {
  try {
    if (!publicIdOrUrl) return null;

    let publicId = publicIdOrUrl;

    // If a full Cloudinary URL is provided, extract public_id
    if (publicIdOrUrl.includes('res.cloudinary.com')) {
      const parts = publicIdOrUrl.split('/upload/');
      if (parts.length > 1) {
        // Drop version tag if present (e.g., v1727150000/folder/file.jpg)
        const afterUpload = parts[1].replace(/^v\d+\//, '');
        // Strip file extension
        publicId = afterUpload.replace(/\.[^/.]+$/, '');
      }
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.warn('[Cloudinary Delete Warning]', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary
};

const { randomUUID } = require('crypto');
const contentType = require('content-type');
const logger = require('../logger');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required fields.');
    }

    // Validate size
    if (typeof size !== 'number') {
      throw new Error('Fragment size must be a number.');
    }
    if (size < 0) {
      throw new Error('Fragment size cannot be negative.');
    }

    const supportedTypes = ['text/plain', 'text/html', 'application/json'];
    const [baseType] = type.split(';'); // Extract the base type (e.g., 'text/plain')

    if (!supportedTypes.includes(baseType.trim())) {
      throw new Error('Invalid fragment type');
    }

    this.id = id || randomUUID(); // Create a new ID if none is provided
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  // Fetch fragments by a specific user
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    if (expand) {
      return fragments.map((fragment) => new Fragment(fragment)); // Return full fragment object
    }
    return fragments;
  }

  // Fetch a specific fragment by userId and fragmentId
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment with id ${id} not found for user ${ownerId}`);
    }
    return new Fragment(fragment);
  }

  // Delete a fragment by userId and fragmentId
  static async delete(ownerId, id) {
    const result = await deleteFragment(ownerId, id);
    if (!result) {
      throw new Error(`Failed to delete fragment with id ${id} for user ${ownerId}`);
    }
  }

  // Save a fragment
  async save() {
    try {
      this.updated = new Date().toISOString(); // Update the 'updated' timestamp
      await writeFragment({
        id: this.id,
        ownerId: this.ownerId,
        created: this.created,
        updated: this.updated,
        type: this.type,
        size: this.size,
      });
      logger.info(`Fragment saved: ${this.id}`);
    } catch (error) {
      logger.error(`Failed to save fragment: ${error.message}`);
      throw new Error('Failed to save fragment: ' + error.message);
    }
  }

  // Fetch fragment data
  async getData() {
    const data = await readFragmentData(this.ownerId, this.id);
    if (!data) {
      throw new Error(`No data found for fragment with id ${this.id}`);
    }
    return data;
  }

  // Set new data for the fragment and save it
  async setData(data) {
    if (!Buffer.isBuffer(data) && typeof data !== 'string') {
      throw new Error('Data must be a Buffer or a string.');
    }
    this.size = Buffer.byteLength(data); // Update the fragment's size
    await writeFragmentData(this.ownerId, this.id, data);
    await this.save(); // Save metadata after updating the data
  }

  // Get mime type from content type
  get mimeType() {
    const { type } = contentType.parse(this.type.trim());
    return type;
  }

  // Check if the fragment is a text type
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  // Supported formats for this fragment type
  get formats() {
    const baseType = this.type.split(';')[0].trim(); // Strip out charset or other parameters

    switch (baseType) {
      case 'text/plain':
        return ['text/plain'];
      case 'text/markdown':
        return ['text/markdown', 'text/html', 'text/plain'];
      case 'text/html':
        return ['text/html', 'text/plain'];
      case 'application/json':
        return ['application/json', 'text/plain'];
      case 'image/png':
      case 'image/jpeg':
      case 'image/webp':
      case 'image/gif':
        return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      default:
        return [];
    }
  }
  // Static method to check if a given type is supported
  static isSupportedType(value) {
    // Extract base type (before the semicolon)
    const baseType = value.split(';')[0].trim();

    // List of supported base types
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'text/html',
      'application/txt',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];

    const isSupported = supportedTypes.includes(baseType);
    
    if (!isSupported) {
      logger.warn(`Unsupported type: ${value}`);
    }

    return isSupported;
  }
}
module.exports.Fragment = Fragment;

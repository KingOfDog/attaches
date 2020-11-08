import ajax from '@codexteam/ajax';

/**
 * Module for file uploading.
 */
export default class Uploader {
  /**
   * @param {object} config
   * @param {Function} onUpload - callback for successful file upload
   * @param {Function} onError - callback for uploading errors
   */
  constructor({ config, onUpload, onError }) {
    this.config = config;
    this.onUpload = onUpload;
    this.onError = onError;
  }

  /**
   * Handle clicks on the upload file button
   *
   * @fires ajax.transport()
   * @param {Function} onPreview - callback fired when preview is ready
   */
  uploadSelectedFile({ onPreview }) {
    let upload;

    // custom uploading
    if (this.config.uploader && typeof this.config.uploader === 'function') {
      upload = ajax.selectFiles({ accept: this.config.types }).then((files) => {
        onPreview(files[0]);

        const customUpload = this.config.uploader(files[0]);

        if (!isPromise(customUpload)) {
          console.warn('Custom uploader method should return a Promise');
        }

        return customUpload;
      });

      // default uploading
    } else {
      upload = ajax.transport({
        url: this.config.endpoint,
        data: this.config.additionalRequestData,
        accept: this.config.types,
        beforeSend: () => onPreview(),
        fieldName: this.config.field,
      }).then((response) => response.body);
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }
}

/**
 * @param object
 */
function isPromise(object) {
  return Promise.resolve(object) === object;
}
const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

module.exports = function mimeType(ext) {
  return TYPES[ext.toLowerCase()] || "application/octet-stream";
};

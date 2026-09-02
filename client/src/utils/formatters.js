/**
 * Format bytes to human readable string (KB, MB, GB, TB)
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format ISO date string to localized relative or formatted date
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get color and icon category based on mimeType or file extension
 */
export function getFileTypeCategory(mimeType = '', filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('tar') ||
    mimeType.includes('rar') ||
    mimeType.includes('compressed') ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
  ) {
    return 'archive';
  }
  if (
    mimeType.includes('text') ||
    mimeType.includes('json') ||
    mimeType.includes('javascript') ||
    ['txt', 'md', 'js', 'json', 'html', 'css', 'ts', 'jsx', 'tsx', 'py'].includes(ext)
  ) {
    return 'code';
  }
  return 'document';
}

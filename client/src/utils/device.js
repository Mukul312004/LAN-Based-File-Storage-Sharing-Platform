/**
 * Generate or retrieve unique persistent client ID
 */
export function getClientId() {
  if (typeof window === 'undefined') return 'server-side';
  let id = localStorage.getItem('lan_dfs_client_id');
  if (!id) {
    id = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('lan_dfs_client_id', id);
  }
  return id;
}

/**
 * Detect user device info and model
 */
export function detectDeviceInfo() {
  if (typeof window === 'undefined') {
    return { name: 'Web Client', type: 'desktop' };
  }

  const ua = navigator.userAgent || '';
  let name = 'Web Device';
  let type = 'desktop';

  if (/iPhone/i.test(ua)) {
    name = 'iPhone';
    type = 'phone';
  } else if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    name = 'iPad Tablet';
    type = 'tablet';
  } else if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) {
      name = 'Android Phone';
      type = 'phone';
    } else {
      name = 'Android Tablet';
      type = 'tablet';
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    name = 'Mac Device';
    type = 'desktop';
  } else if (/Windows/i.test(ua)) {
    name = 'Windows PC';
    type = 'desktop';
  } else if (/Linux/i.test(ua)) {
    name = 'Linux Device';
    type = 'desktop';
  }

  const storedName = localStorage.getItem('lan_dfs_device_name');
  return {
    name: storedName || name,
    type,
    id: getClientId(),
  };
}

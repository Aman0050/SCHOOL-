export interface DeviceInfo {
  deviceType: string;
  osName: string;
  browserName: string;
}

export const parseUserAgent = (userAgentString?: string): DeviceInfo => {
  if (!userAgentString) {
    return { deviceType: 'Unknown', osName: 'Unknown', browserName: 'Unknown' };
  }

  let deviceType = 'Desktop';
  if (/mobile/i.test(userAgentString)) {
    deviceType = 'Mobile';
  } else if (/tablet/i.test(userAgentString) || /ipad/i.test(userAgentString)) {
    deviceType = 'Tablet';
  }

  let osName = 'Unknown';
  if (/windows/i.test(userAgentString)) osName = 'Windows';
  else if (/macintosh|mac os x/i.test(userAgentString)) osName = 'macOS';
  else if (/android/i.test(userAgentString)) osName = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgentString)) osName = 'iOS';
  else if (/linux/i.test(userAgentString)) osName = 'Linux';

  let browserName = 'Unknown';
  if (/chrome|crios/i.test(userAgentString)) browserName = 'Chrome';
  else if (/safari/i.test(userAgentString) && !/chrome/i.test(userAgentString)) browserName = 'Safari';
  else if (/firefox|iceweasel/i.test(userAgentString)) browserName = 'Firefox';
  else if (/msie|trident/i.test(userAgentString)) browserName = 'Internet Explorer';
  else if (/edge|edg/i.test(userAgentString)) browserName = 'Edge';

  return { deviceType, osName, browserName };
};

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use current location
    // EXCEPT if it's localhost, we might need the external IP for QR codes
    if (window.location.hostname === 'localhost' && process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    return window.location.origin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  return 'http://localhost:3000';
};

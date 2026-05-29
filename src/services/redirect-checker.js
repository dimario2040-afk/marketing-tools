/**
 * Redirect Checker service.
 *
 * Follows a URL's redirect chain and returns each step with status code and URL.
 */

const axios = require('axios');

const MAX_REDIRECTS = 10;

/**
 * Follow the redirect chain for a given URL.
 * @param {string} url
 * @returns {Promise<{chain: Array<{status: number, url: string}>, finalUrl: string, finalStatus: number}>}
 */
async function checkRedirect(url) {
  const chain = [];
  let currentUrl = url;
  let finalStatus = 0;

  for (let i = 0; i < MAX_REDIRECTS; i++) {
    try {
      const response = await axios.get(currentUrl, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MarketingTools/1.0)'
        }
      });

      finalStatus = response.status;
      chain.push({ status: response.status, url: response.request.res.responseUrl || currentUrl });

      const location = response.headers['location'];
      if (location && (response.status >= 301 && response.status <= 308)) {
        currentUrl = new URL(location, currentUrl).href;
        chain.push({ status: 0, url: currentUrl });
        continue;
      }

      // Not a redirect
      break;
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        chain.push({ status, url: currentUrl });
        const location = err.response.headers['location'];
        if (location && status >= 301 && status <= 308) {
          currentUrl = new URL(location, currentUrl).href;
          continue;
        }
        finalStatus = status;
        break;
      }
      // Network error
      chain.push({ status: 0, url: currentUrl, error: err.message });
      finalStatus = 0;
      break;
    }
  }

  return { chain, finalUrl: currentUrl, finalStatus };
}

module.exports = { checkRedirect };

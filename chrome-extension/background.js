const API_URL = 'https://shieldsight-gsnq.onrender.com';

// Track statistics
let stats = {
  totalScans: 0,
  threatsBlocked: 0,
  safeLinks: 0,
  lastReset: Date.now()
};

// Load stats from storage
chrome.storage.local.get(['stats'], (result) => {
  if (result.stats) {
    stats = result.stats;
  }
});

// Check URL safety (Normal Mode)
async function checkURL(url) {
  try {
    const response = await fetch(`${API_URL}/predict/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

// Check URL safety (Fast Mode - Level 1A)
async function checkURLFast(url) {
  try {
    // If your backend has a /predict/fast, use it. Otherwise fallback to /predict/
    const response = await fetch(`${API_URL}/predict/fast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }).catch(() => fetch(`${API_URL}/predict/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }));

    const data = await response.json();

    // Update stats and badge if phishing
    if (data.prediction === 'phishing') {
      stats.threatsBlocked++;
      stats.totalScans++;
      chrome.storage.local.set({ stats });
      chrome.action.setBadgeText({ text: stats.threatsBlocked.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Download Link Scan (Level 3G)
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  const result = await checkURL(downloadItem.url);
  if (result && result.prediction === 'phishing') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⚠️ Dangerous Download Blocked',
      message: `The download from ${new URL(downloadItem.url).hostname} was flagged as a phishing risk.`,
      priority: 2
    });
    chrome.downloads.cancel(downloadItem.id);
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkURL') {
    checkURL(request.url).then(sendResponse);
    return true;
  }

  if (request.action === 'checkURLFast') {
    checkURLFast(request.url).then(sendResponse);
    return true;
  }

  if (request.action === 'getStats') {
    sendResponse(stats);
  }

  if (request.action === 'showNotification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🛡️ ShieldSight Alert',
      message: request.message,
      priority: 2
    });
  }
});
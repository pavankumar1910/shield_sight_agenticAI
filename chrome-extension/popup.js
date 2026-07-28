// Load stats
chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
  document.getElementById('totalScans').textContent = stats.totalScans || 0;
  document.getElementById('threatsBlocked').textContent = stats.threatsBlocked || 0;
  document.getElementById('safeLinks').textContent = stats.safeLinks || 0;
});

// Open dashboard button
document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://shieldsight.vercel.app' });
});
// Cache for scanned URLs
const urlCache = new Map();
let pageRiskScore = 0;
let isPhishingPage = false;

// Create tooltip element
const tooltip = document.createElement('div');
tooltip.className = 'shieldsight-tooltip';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

// --- Level 1A: Auto-Scan Current Page on Load ---
async function autoScanPage() {
  const currentUrl = window.location.href;
  const result = await chrome.runtime.sendMessage({
    action: 'checkURLFast',
    url: currentUrl
  });

  if (result && result.prediction === 'phishing') {
    isPhishingPage = true;
    showRiskBanner(result.confidence);
  }
}

// --- Level 1C: Page-Level Risk Banner ---
function showRiskBanner(confidence) {
  if (document.querySelector('.shieldsight-risk-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'shieldsight-risk-banner';
  banner.innerHTML = `
    <span>🚨 Warning: This site is likely phishing (${(confidence * 100).toFixed(0)}%)</span>
    <button id="ss-ignore-banner">Ignore</button>
  `;
  document.body.prepend(banner);
  document.body.style.marginTop = '45px';

  document.getElementById('ss-ignore-banner').onclick = () => {
    banner.remove();
    document.body.style.marginTop = '0';
  };
}

// --- Level 1B: Link Hover Detection (with Debounce) ---
let hoverTimeout;
async function handleHover(link) {
  const url = link.href;
  if (!url.startsWith('http')) return;

  const rect = link.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.display = 'block';

  // Check cache first
  if (urlCache.has(url)) {
    updateTooltip(urlCache.get(url));
    return;
  }

  tooltip.innerHTML = `<div class="loading"><div class="spinner"></div> Scanning...</div>`;

  const result = await chrome.runtime.sendMessage({
    action: 'checkURL',
    url: url
  });

  if (result) {
    urlCache.set(url, result);
    updateTooltip(result);
    link.classList.add(result.prediction === 'phishing' ? 'shieldsight-danger' : 'shieldsight-safe');
  } else {
    tooltip.style.display = 'none';
  }
}

function updateTooltip(result) {
  const isPhishing = result.prediction === 'phishing';
  const confidence = (result.confidence * 100).toFixed(1);
  tooltip.innerHTML = `
    <div class="result ${isPhishing ? 'danger' : 'safe'}">
      <div class="icon">${isPhishing ? '⚠️' : '✓'}</div>
      <div class="info">
        <strong>${isPhishing ? 'DANGER' : 'SAFE'}</strong>
        <span>${confidence}% confidence</span>
      </div>
    </div>
  `;
}

// --- Level 2D: DOM Link Scan (Heuristic) ---
function scanLinksHeuristically() {
  document.querySelectorAll('a[href]').forEach(link => {
    const url = link.href;
    const hostname = new URL(url).hostname;

    // Simple heuristics
    const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isSuspiciousTLD = hostname.endsWith('.tk') || hostname.endsWith('.xyz') || hostname.endsWith('.pw');

    if (isIp || isSuspiciousTLD) {
      link.classList.add('shieldsight-suspicious-link');
      link.title = "ShieldSight Warning: This link uses a suspicious domain/TLD.";
    }
  });
}

// --- Level 2E: Form Submission Intercept ---
function interceptForms() {
  document.addEventListener('submit', (e) => {
    const form = e.target;
    const hasPasswordField = form.querySelector('input[type="password"]');

    if (hasPasswordField && isPhishingPage) {
      e.preventDefault();
      showFormWarningModal(() => {
        form.submit(); // Proceed anyway
      });
    }
  }, true);
}

function showFormWarningModal(onProceed) {
  const overlay = document.createElement('div');
  overlay.className = 'shieldsight-modal-overlay';
  overlay.innerHTML = `
    <div class="shieldsight-modal">
      <h2>🛡️ Security Alert</h2>
      <p>You are about to submit credentials on a highly suspicious site. This could be a phishing attempt to steal your password.</p>
      <div class="shieldsight-modal-buttons">
        <button class="shieldsight-modal-btn cancel">Stop (Recommended)</button>
        <button class="shieldsight-modal-btn proceed">I trust this site</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.cancel').onclick = () => overlay.remove();
  overlay.querySelector('.proceed').onclick = () => {
    overlay.remove();
    onProceed();
  };
}

// --- Level 3F: Clipboard URL Monitor ---
function setupClipboardMonitor() {
  document.addEventListener('paste', async (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text.startsWith('http://') || text.startsWith('https://')) {
      const result = await chrome.runtime.sendMessage({
        action: 'checkURL',
        url: text
      });
      if (result && result.prediction === 'phishing') {
        alert(`⚠️ ShieldSight Warning: The URL you just pasted is flagged as phishing!\n\nURL: ${text}`);
      }
    }
  });
}

// --- Initialize and Event Listeners ---
function attachListeners() {
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.dataset.ssScanned) return;
    link.dataset.ssScanned = 'true';

    link.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => handleHover(link), 300); // 300ms Debounce
    });

    link.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      tooltip.style.display = 'none';
    });

    link.addEventListener('click', (e) => {
      const url = link.href;
      const result = urlCache.get(url);
      if (result && result.prediction === 'phishing') {
        const proceed = confirm("⚠️ PHISHING WARNING\n\nThis link is dangerous. Proceed anyway?");
        if (!proceed) e.preventDefault();
      }
    });
  });
}

// Start everything
autoScanPage();
attachListeners();
scanLinksHeuristically();
interceptForms();
setupClipboardMonitor();

// Watch for dynamic content
const observer = new MutationObserver(() => {
  attachListeners();
  scanLinksHeuristically();
});
observer.observe(document.body, { childList: true, subtree: true });
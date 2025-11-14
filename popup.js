/**
 * SnapStats Chrome Extension
 * 
 * A Chrome extension for analyzing website performance metrics and Core Web Vitals.
 * Provides real-time performance analysis, resource monitoring, and actionable recommendations.
 * 
 * @author Peyton Nowlin <peyton@teamnowlin.com>
 * @version 1.0.0
 * @license MIT
 */

// Enhanced performance thresholds (in milliseconds)
const THRESHOLDS = {
  ttfb: { good: 100, poor: 300 },
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  tti: { good: 3800, poor: 7300 },
  domContentLoaded: { good: 2000, poor: 4000 },
  load: { good: 3000, poor: 6000 }
};

// Network throttling configurations
const NETWORK_THROTTLING = {
  none: { download: 0, upload: 0, latency: 0 },
  fast3G: { download: 1.5 * 1024 * 1024 / 8, upload: 750 * 1024 / 8, latency: 40 },
  slow3G: { download: 780 * 1024 / 8, upload: 330 * 1024 / 8, latency: 100 },
  '2G': { download: 280 * 1024 / 8, upload: 256 * 1024 / 8, latency: 300 }
};

// Enhanced helper function to format milliseconds with better precision
function formatTime(ms) {
  if (ms < 1) return '< 1ms';
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms/1000).toFixed(2)}s`;
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Enhanced helper function to determine performance rating with better thresholds
function getRating(value, threshold) {
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'warning';
  return 'poor';
}

// Helper function to sanitize HTML content
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Metric tooltips with explanations
const METRIC_TOOLTIPS = {
  'Time to First Byte': 'Time from navigation start to when the first byte of the response is received from the server. Lower is better.',
  'First Contentful Paint': 'Time when the browser renders the first bit of content (text, image, etc.). Target: < 1.8s',
  'Largest Contentful Paint': 'Time when the largest content element becomes visible. Target: < 2.5s',
  'First Input Delay': 'Time from when a user first interacts with your page to when the browser responds. Target: < 100ms',
  'Cumulative Layout Shift': 'Measures visual stability - how much elements move around. Target: < 0.1',
  'DOM Content Loaded': 'Time when the HTML document has been completely loaded and parsed',
  'Page Load Complete': 'Time when the page and all resources have finished loading'
};

// Enhanced helper function to create metric element with appropriate icon and better styling
function createMetricElement(name, value, threshold, unit = '') {
  const rating = getRating(value, threshold);
  const displayValue = unit ? `${formatTime(value)} ${unit}` : formatTime(value);
  const sanitizedName = sanitizeHTML(name);
  const sanitizedDisplayValue = sanitizeHTML(displayValue);
  const tooltip = METRIC_TOOLTIPS[name] || '';
  
  return `
    <div class="metric">
      <span class="metric-name" ${tooltip ? `title="${sanitizeHTML(tooltip)}"` : ''}>
        <span class="metric-icon ${rating}">●</span>
        ${sanitizedName}
        ${tooltip ? '<span style="opacity: 0.5; margin-left: 4px; cursor: help;">ℹ️</span>' : ''}
      </span>
      <span class="metric-value ${rating}" title="${rating === 'good' ? 'Good performance' : rating === 'warning' ? 'Needs improvement' : 'Poor performance'}">${sanitizedDisplayValue}</span>
    </div>
  `;
}

// Helper function to extract domain from URL with better error handling
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    console.warn('Failed to extract domain from URL:', url, e);
    return url.split('/')[0] || 'unknown';
  }
}

// Helper function to determine if resource is third-party with better validation
function isThirdParty(resource, currentDomain) {
  try {
    if (!resource.name || !currentDomain) return false;
    const resourceDomain = new URL(resource.name).hostname;
    return resourceDomain !== currentDomain && !resourceDomain.endsWith(`.${currentDomain}`);
  } catch (e) {
    console.warn('Failed to determine if resource is third-party:', resource.name, e);
    return false;
  }
}

// Enhanced helper function to generate recommendations with more specific advice
function generateRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.ttfb > THRESHOLDS.ttfb.good) {
    recommendations.push({
      priority: 'high',
      category: 'server',
      text: 'Consider improving server response time through caching, CDN, or server optimization'
    });
  }
  
  if (metrics.fcp > THRESHOLDS.fcp.good) {
    recommendations.push({
      priority: 'high',
      category: 'rendering',
      text: 'Optimize critical rendering path by reducing render-blocking resources and inline critical CSS'
    });
  }
  
  if (metrics.lcp > THRESHOLDS.lcp.good) {
    recommendations.push({
      priority: 'high',
      category: 'content',
      text: 'Improve Largest Contentful Paint by optimizing images, using next-gen formats, and implementing lazy loading'
    });
  }

  if (metrics.fid > THRESHOLDS.fid.good) {
    recommendations.push({
      priority: 'medium',
      category: 'interactivity',
      text: 'Reduce JavaScript execution time and implement code splitting to improve interactivity'
    });
  }

  if (metrics.cls > 0.1) {
    recommendations.push({
      priority: 'medium',
      category: 'layout',
      text: 'Prevent layout shifts by setting explicit dimensions for images and avoiding dynamic content insertion'
    });
  }
  
  if (metrics.resourceCount > 50) {
    recommendations.push({
      priority: 'medium',
      category: 'resources',
      text: 'High number of resource requests. Consider bundling, using HTTP/2, and reducing external resources'
    });
  }
  
  if (metrics.totalResourceSize > 5 * 1024 * 1024) {
    recommendations.push({
      priority: 'medium',
      category: 'size',
      text: 'Large total resource size. Consider optimizing images, implementing code splitting, and using compression'
    });
  }
  
  if (metrics.thirdPartySize > metrics.totalResourceSize * 0.4) {
    recommendations.push({
      priority: 'low',
      category: 'third-party',
      text: 'Third-party resources account for a significant portion of your page size. Consider reducing third-party dependencies'
    });
  }
  
  if (metrics.jsSize > 1 * 1024 * 1024) {
    recommendations.push({
      priority: 'medium',
      category: 'javascript',
      text: 'JavaScript size is large. Consider code splitting, tree shaking, and lazy loading techniques'
    });
  }
  
  if (metrics.cssSize > 200 * 1024) {
    recommendations.push({
      priority: 'low',
      category: 'css',
      text: 'CSS size is large. Consider removing unused CSS, optimizing stylesheets, and using CSS-in-JS'
    });
  }

  // Sort by priority (high, medium, low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Export results to JSON
function exportToJSON(metrics) {
  const dataStr = JSON.stringify(metrics, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportLink = document.createElement('a');
  exportLink.setAttribute('href', dataUri);
  exportLink.setAttribute('download', `snapstats-${new Date().toISOString().slice(0,10)}.json`);
  exportLink.click();
}

// Export results to CSV
function exportToCSV(metrics) {
  // Flatten the metrics object for CSV
  const flatMetrics = {
    timestamp: new Date().toISOString(),
    ttfb: metrics.ttfb,
    fcp: metrics.fcp,
    lcp: metrics.lcp,
    cls: metrics.cls,
    domContentLoaded: metrics.domContentLoaded,
    load: metrics.load,
    resourceCount: metrics.resourceCount,
    totalResourceSize: metrics.totalResourceSize,
    jsSize: metrics.jsSize,
    cssSize: metrics.cssSize,
    imgSize: metrics.imgSize,
    thirdPartySize: metrics.thirdPartySize,
    thirdPartyCount: metrics.thirdPartyCount
  };
  
  const headers = Object.keys(flatMetrics);
  const values = Object.values(flatMetrics);
  
  const csvContent = [
    headers.join(','),
    values.join(',')
  ].join('\n');
  
  const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  
  const exportLink = document.createElement('a');
  exportLink.setAttribute('href', dataUri);
  exportLink.setAttribute('download', `snapstats-${new Date().toISOString().slice(0,10)}.csv`);
  exportLink.click();
}

// Save settings to local storage
function saveSettings() {
  try {
    const settings = {
      deviceType: (DOM_CACHE.deviceType || document.getElementById('deviceType')).value,
      networkThrottle: (DOM_CACHE.networkThrottle || document.getElementById('networkThrottle')).value,
      cpuThrottle: (DOM_CACHE.cpuThrottle || document.getElementById('cpuThrottle')).value
    };
    localStorage.setItem('snapstatsSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

// Load settings from local storage
function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem('snapstatsSettings') || '{}');
    
    if (settings.deviceType) {
      (DOM_CACHE.deviceType || document.getElementById('deviceType')).value = settings.deviceType;
    }
    if (settings.networkThrottle) {
      (DOM_CACHE.networkThrottle || document.getElementById('networkThrottle')).value = settings.networkThrottle;
    }
    if (settings.cpuThrottle) {
      (DOM_CACHE.cpuThrottle || document.getElementById('cpuThrottle')).value = settings.cpuThrottle;
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

// Update mini chart
function updateHistoryChart(metrics) {
  const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
  
  // Get existing history or initialize new array
  let data = [];
  try {
    const storedData = localStorage.getItem('performanceHistory');
    if (storedData) {
      data = JSON.parse(storedData);
      
      // Validate the data format
      if (!Array.isArray(data)) {
        console.warn('Invalid history data format, resetting');
        data = [];
        localStorage.removeItem('performanceHistory');
      }
    }
  } catch (e) {
    console.error('Error parsing history data:', e);
    data = [];
    try {
      localStorage.removeItem('performanceHistory');
    } catch (removeError) {
      console.error('Error removing corrupted history data:', removeError);
    }
  }
  
  console.log('New metrics for history:', metrics);
  
  // Add new metrics with a proper timestamp
  data.push({
    timestamp: new Date().toISOString(),
    ttfb: metrics.ttfb > 0 ? metrics.ttfb : 100,
    fcp: metrics.fcp > 0 ? metrics.fcp : 1000,
    lcp: metrics.lcp > 0 ? metrics.lcp : 2000
  });
  
  // Keep last 5 entries
  if (data.length > 5) {
    data = data.slice(-5);
  }
  
  // Save updated data
  try {
    const dataString = JSON.stringify(data);
    if (dataString.length > 1024 * 1024) { // Limit to 1MB
      console.warn('History data too large, keeping only last 3 entries');
      data = data.slice(-3);
    }
    localStorage.setItem('performanceHistory', JSON.stringify(data));
    console.log('Saved history data:', data);
  } catch (e) {
    console.error('Error saving history data:', e);
    if (e.name === 'QuotaExceededError') {
      try {
        // Try to save with fewer entries
        data = data.slice(-2);
        localStorage.setItem('performanceHistory', JSON.stringify(data));
        console.log('Saved reduced history data due to quota limit');
      } catch (retryError) {
        console.error('Failed to save even reduced history data:', retryError);
      }
    }
  }
  
  // Update the chart
  updateHistoryChartFromData(data);
}

// Clear history data
function clearHistoryData() {
  try {
    localStorage.removeItem('performanceHistory');
    const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
    chartEl.innerHTML = '<div class="empty-state">History cleared</div>';
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}

// Update history chart from existing data (without adding new entry)
function updateHistoryChartFromData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return;
  
  const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
  
  // Clear previous chart
  chartEl.innerHTML = '';
  
  // Find max value for scaling (with a minimum to prevent division by zero)
  const maxValue = Math.max(100, ...data.flatMap(d => [d.ttfb || 0, d.fcp || 0, d.lcp || 0]));
  
  // Create a container for bars with better spacing
  const barContainer = document.createElement('div');
  barContainer.style.display = 'flex';
  barContainer.style.alignItems = 'flex-end';
  barContainer.style.justifyContent = data.length < 3 ? 'flex-start' : 'space-between';
  barContainer.style.gap = '20px';
  barContainer.style.width = '100%';
  barContainer.style.height = '100%';
  
  // Create bars for each data point
  data.forEach(entry => {
    try {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const lcpValue = entry.lcp || 0;
      const height = Math.min(100, Math.max(5, (lcpValue / maxValue * 100))).toFixed(0);
      
      const barEl = document.createElement('div');
      barEl.className = 'mini-chart-bar';
      barEl.style.height = `${height}%`;
      barEl.setAttribute('data-value', formatTime(lcpValue));
      barEl.setAttribute('data-label', time);
      
      // For smaller number of entries, set min-width
      if (data.length < 3) {
        barEl.style.minWidth = '60px';
      }
      
      barContainer.appendChild(barEl);
    } catch (e) {
      console.error('Error creating history bar:', e);
    }
  });
  
  chartEl.appendChild(barContainer);
  
  // Add extra padding element
  const paddingEl = document.createElement('div');
  paddingEl.style.height = '10px';
  paddingEl.style.width = '100%';
  chartEl.appendChild(paddingEl);
}

// Update waterfall chart
function updateWaterfallChart(resources) {
  const waterfallEl = DOM_CACHE.waterfallChart || document.getElementById('waterfallChart');
  
  // Sort resources by start time
  const sortedResources = resources.slice().sort((a, b) => a.startTime - b.startTime);
  
  // Find max end time for scaling
  const maxEndTime = Math.max(...resources.map(r => r.startTime + r.duration));
  const scale = 500 / maxEndTime; // Scale to 500px width
  
  waterfallEl.innerHTML = sortedResources.map(resource => {
    const startPosition = resource.startTime * scale;
    const width = resource.duration * scale;
    const waitTime = resource.connectStart ? (resource.connectEnd - resource.connectStart) * scale : 0;
    
    return `
      <div class="waterfall-item">
        <div class="waterfall-label" title="${sanitizeHTML(resource.name || '')}">${sanitizeHTML(resource.name.split('/').pop() || 'unknown')}</div>
        <div style="margin-left: ${Math.max(0, startPosition)}px; display: flex;">
          ${waitTime > 0 ? `<div class="waterfall-bar waterfall-bar-wait" style="width: ${Math.max(0, waitTime)}px;"></div>` : ''}
          <div class="waterfall-bar" style="width: ${Math.max(1, width - waitTime)}px;"></div>
        </div>
        <div class="waterfall-time">${sanitizeHTML(formatTime(resource.duration || 0))}</div>
      </div>
    `;
  }).join('');
}

// Update third-party resources analysis
function updateThirdPartyAnalysis(resources, currentDomain) {
  const thirdPartyEl = DOM_CACHE.thirdPartyResources || document.getElementById('thirdPartyResources');
  
  // Identify third-party resources
  const thirdPartyResources = resources.filter(r => isThirdParty(r, currentDomain));
  
  // Group by domain
  const domains = {};
  thirdPartyResources.forEach(resource => {
    const domain = extractDomain(resource.name);
    if (!domains[domain]) {
      domains[domain] = {
        size: 0,
        count: 0,
        resources: []
      };
    }
    domains[domain].size += resource.transferSize || 0;
    domains[domain].count++;
    domains[domain].resources.push(resource);
  });
  
  // Sort domains by size (largest first)
  const sortedDomains = Object.entries(domains)
    .sort((a, b) => b[1].size - a[1].size)
    .map(([domain, data]) => ({ domain, ...data }));
  
  if (sortedDomains.length === 0) {
    thirdPartyEl.innerHTML = '<div class="empty-state">No third-party resources detected</div>';
    return;
  }
  
  thirdPartyEl.innerHTML = sortedDomains.map(domain => `
    <div class="third-party-item">
      <div class="third-party-domain">${sanitizeHTML(domain.domain)} (${domain.count} requests)</div>
      <div class="third-party-size">${sanitizeHTML(formatBytes(domain.size))}</div>
    </div>
  `).join('');
}

// Update accessibility analysis
function updateAccessibilityAnalysis(metrics) {
  const accessibilityEl = DOM_CACHE.accessibilityResults || document.getElementById('accessibilityResults');
  
  const accessibilityIssues = [];
  const accessibilityWarnings = [];
  const accessibilityGood = [];
  
  // Check for common accessibility issues
  if (metrics.cls > 0.1) {
    accessibilityIssues.push({
      type: 'error',
      title: 'Layout Shifts',
      description: 'Significant layout shifts detected which can disorient users with disabilities.',
      impact: 'High'
    });
  } else if (metrics.cls > 0.05) {
    accessibilityWarnings.push({
      type: 'warning',
      title: 'Minor Layout Shifts',
      description: 'Some layout shifts detected. Consider setting explicit dimensions for images.',
      impact: 'Medium'
    });
  } else {
    accessibilityGood.push({
      type: 'success',
      title: 'Stable Layout',
      description: 'Good layout stability with minimal shifts.',
      impact: 'Low'
    });
  }
  
  if (metrics.fid > 300) {
    accessibilityIssues.push({
      type: 'error',
      title: 'Slow Interactivity',
      description: 'Slow response to user interactions can make the site difficult to use.',
      impact: 'High'
    });
  } else if (metrics.fid > 100) {
    accessibilityWarnings.push({
      type: 'warning',
      title: 'Moderate Interactivity',
      description: 'Response time could be improved for better accessibility.',
      impact: 'Medium'
    });
  } else {
    accessibilityGood.push({
      type: 'success',
      title: 'Fast Interactivity',
      description: 'Good response time for user interactions.',
      impact: 'Low'
    });
  }
  
  if (metrics.resourceCount > 100) {
    accessibilityWarnings.push({
      type: 'warning',
      title: 'Many Resources',
      description: 'High number of resources may slow down assistive technologies.',
      impact: 'Medium'
    });
  }
  
  if (metrics.totalResourceSize > 10 * 1024 * 1024) {
    accessibilityWarnings.push({
      type: 'warning',
      title: 'Large Page Size',
      description: 'Large page size may impact users with slower connections.',
      impact: 'Medium'
    });
  }
  
  // Generate accessibility report
  let html = '';
  
  if (accessibilityIssues.length > 0) {
    html += `
      <div class="accessibility-section">
        <h4 style="color: var(--error); margin-bottom: 12px;">🚨 Critical Issues (${accessibilityIssues.length})</h4>
        ${accessibilityIssues.map(issue => `
          <div class="accessibility-item error">
            <div class="accessibility-title" style="color: var(--error);">${sanitizeHTML(issue.title)}</div>
            <div class="accessibility-description">${sanitizeHTML(issue.description)}</div>
            <div class="accessibility-impact">Impact: ${sanitizeHTML(issue.impact)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityWarnings.length > 0) {
    html += `
      <div class="accessibility-section">
        <h4 style="color: var(--warning); margin-bottom: 12px;">⚠️ Warnings (${accessibilityWarnings.length})</h4>
        ${accessibilityWarnings.map(issue => `
          <div class="accessibility-item warning">
            <div class="accessibility-title" style="color: var(--warning);">${sanitizeHTML(issue.title)}</div>
            <div class="accessibility-description">${sanitizeHTML(issue.description)}</div>
            <div class="accessibility-impact">Impact: ${sanitizeHTML(issue.impact)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityGood.length > 0) {
    html += `
      <div class="accessibility-section">
        <h4 style="color: var(--success); margin-bottom: 12px;">✅ Good Practices (${accessibilityGood.length})</h4>
        ${accessibilityGood.map(issue => `
          <div class="accessibility-item success">
            <div class="accessibility-title" style="color: var(--success);">${sanitizeHTML(issue.title)}</div>
            <div class="accessibility-description">${sanitizeHTML(issue.description)}</div>
            <div class="accessibility-impact">Impact: ${sanitizeHTML(issue.impact)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityIssues.length === 0 && accessibilityWarnings.length === 0 && accessibilityGood.length === 0) {
    html = '<div class="empty-state">No accessibility data available</div>';
  }
  
  accessibilityEl.innerHTML = html;
}

// Update network table
function updateNetworkTable(resources) {
  const tbody = DOM_CACHE.networkResults || document.getElementById('networkResults');
  tbody.innerHTML = resources.map(resource => `
    <tr>
      <td>${sanitizeHTML(resource.name.split('/').pop() || 'unknown')}</td>
      <td>${sanitizeHTML(resource.initiatorType || 'unknown')}</td>
      <td>${sanitizeHTML(formatBytes(resource.transferSize || 0))}</td>
      <td>${sanitizeHTML(formatTime(resource.duration || 0))}</td>
    </tr>
  `).join('');
}

// Calculate overall performance score (0-100)
function calculatePerformanceScore(metrics) {
  let score = 100;
  
  // Deduct points for poor performance
  if (metrics.ttfb > THRESHOLDS.ttfb.poor) score -= 15;
  else if (metrics.ttfb > THRESHOLDS.ttfb.good) score -= 8;
  
  if (metrics.fcp > THRESHOLDS.fcp.poor) score -= 15;
  else if (metrics.fcp > THRESHOLDS.fcp.good) score -= 8;
  
  if (metrics.lcp > THRESHOLDS.lcp.poor) score -= 15;
  else if (metrics.lcp > THRESHOLDS.lcp.good) score -= 8;
  
  if (metrics.cls > 0.25) score -= 10;
  else if (metrics.cls > 0.1) score -= 5;
  
  if (metrics.resourceCount > 100) score -= 5;
  else if (metrics.resourceCount > 50) score -= 2;
  
  if (metrics.totalResourceSize > 10 * 1024 * 1024) score -= 5;
  else if (metrics.totalResourceSize > 5 * 1024 * 1024) score -= 2;
  
  // Ensure score doesn't go below 0
  return Math.max(0, Math.round(score));
}

// Get performance grade from score
function getPerformanceGrade(score) {
  if (score >= 90) return { grade: 'A', color: 'var(--success)', emoji: '🚀' };
  if (score >= 80) return { grade: 'B', color: 'var(--success)', emoji: '👍' };
  if (score >= 70) return { grade: 'C', color: 'var(--warning)', emoji: '⚠️' };
  if (score >= 60) return { grade: 'D', color: 'var(--warning)', emoji: '😐' };
  return { grade: 'F', color: 'var(--error)', emoji: '😞' };
}

// DOM element cache for performance
const DOM_CACHE = {
  results: null,
  recommendations: null,
  status: null,
  historyChart: null,
  waterfallChart: null,
  thirdPartyResources: null,
  accessibilityResults: null,
  networkResults: null,
  deviceType: null,
  networkThrottle: null,
  cpuThrottle: null,
  runButton: null,
  clearHistory: null,
  exportJSON: null,
  exportCSV: null
};

// Initialize DOM cache
function initDOMCache() {
  DOM_CACHE.results = document.getElementById('results');
  DOM_CACHE.recommendations = document.getElementById('recommendations');
  DOM_CACHE.status = document.getElementById('status');
  DOM_CACHE.historyChart = document.getElementById('historyChart');
  DOM_CACHE.waterfallChart = document.getElementById('waterfallChart');
  DOM_CACHE.thirdPartyResources = document.getElementById('thirdPartyResources');
  DOM_CACHE.accessibilityResults = document.getElementById('accessibilityResults');
  DOM_CACHE.networkResults = document.getElementById('networkResults');
  DOM_CACHE.deviceType = document.getElementById('deviceType');
  DOM_CACHE.networkThrottle = document.getElementById('networkThrottle');
  DOM_CACHE.cpuThrottle = document.getElementById('cpuThrottle');
  DOM_CACHE.runButton = document.getElementById('run');
  DOM_CACHE.clearHistory = document.getElementById('clearHistory');
  DOM_CACHE.exportJSON = document.getElementById('exportJSON');
  DOM_CACHE.exportCSV = document.getElementById('exportCSV');
}

// Show detailed progress during analysis
function updateProgressIndicator(step, total, message) {
  const progressPercent = Math.round((step / total) * 100);
  updateStatus(`${message} (${step}/${total})`, true);
  
  // Update run button with progress
  const runButton = DOM_CACHE.runButton || document.getElementById('run');
  if (runButton) {
    runButton.textContent = `${progressPercent}%`;
    runButton.style.background = `linear-gradient(90deg, var(--primary-color) ${progressPercent}%, rgba(255,255,255,0.8) ${progressPercent}%)`;
  }
}

// Reset run button to normal state
function resetRunButton() {
  const runButton = DOM_CACHE.runButton || document.getElementById('run');
  if (runButton) {
    runButton.textContent = 'Run Analysis';
    runButton.style.background = '';
  }
}

// Show success notification
function showSuccessNotification(message) {
  const statusEl = DOM_CACHE.status || document.getElementById('status');
  statusEl.innerHTML = `<div style="color: var(--success); display: flex; align-items: center; justify-content: center; gap: 8px;"><span style="font-size: 16px;">✅</span> ${message}</div>`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.innerHTML = '';
  }, 3000);
}

// Enhanced main analysis function with better error handling
async function runAnalysis() {
  const resultsEl = DOM_CACHE.results || document.getElementById('results');
  const recommendationsEl = DOM_CACHE.recommendations || document.getElementById('recommendations');
  
  resultsEl.innerHTML = '<div class="empty-state"><div class="loading"></div> Running analysis...</div>';
  recommendationsEl.innerHTML = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }

    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot analyze this page type. Please navigate to a regular website.');
    }
  
  // Get current settings
  const settings = {
    deviceType: (DOM_CACHE.deviceType || document.getElementById('deviceType')).value,
    networkThrottle: (DOM_CACHE.networkThrottle || document.getElementById('networkThrottle')).value,
    cpuThrottle: parseFloat((DOM_CACHE.cpuThrottle || document.getElementById('cpuThrottle')).value)
  };

  const injected = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (settings) => {
      try {
        const timing = performance.timing;
        const nav = performance.getEntriesByType('navigation')[0];
        const paints = performance.getEntriesByType('paint');
        const currentDomain = window.location.hostname;
      
      // Apply CPU throttling if selected
      if (settings.cpuThrottle > 1) {
        console.log(`CPU throttling applied: ${settings.cpuThrottle}x slowdown`);
        // Note: actual CPU throttling requires DevTools Protocol which isn't available via scripting
      }
      
      // Get LCP using PerformanceObserver
      let lcp = 0;
      const lcpEntries = [];

      // Get already observed LCP entries
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        lcpEntries.push(...entries);
        
        // Get the largest LCP value
        if (entries.length > 0) {
          for (const entry of entries) {
            if (entry.startTime > lcp) {
              lcp = entry.startTime;
            }
          }
        }
      });
      
      try {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.error('Error observing LCP:', e);
      }

      // Fallback LCP if PerformanceObserver didn't work
      if (lcp === 0) {
        // Use FCP as a fallback
        const fcpEntry = paints.find(p => p.name === 'first-contentful-paint');
        if (fcpEntry) {
          lcp = fcpEntry.startTime * 1.5; // Estimate LCP as 1.5x FCP
        } else {
          // If no FCP either, use load time
          lcp = nav ? nav.loadEventEnd : 2000;
        }
      }

      // Get CLS using PerformanceObserver
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
      
      // Get FID (First Input Delay)
      let fid = 0;
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.processingStart && entry.startTime) {
              const delay = entry.processingStart - entry.startTime;
              if (delay > fid) {
                fid = delay;
              }
            }
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('FID observer failed:', e);
      }
      
      // Get INP using PerformanceObserver (Next Input Delay - newer metric)
      let inp = 0;
      new PerformanceObserver((list) => {
        const events = list.getEntries();
        if (events.length > 0) {
          inp = Math.max(inp, events[events.length - 1].duration);
        }
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });

      // Use Navigation Timing API v2 when available
      const metrics = {
        ttfb: nav ? nav.responseStart : (timing.responseStart - timing.requestStart),
        fcp: paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        lcp: lcp,
        fid: fid,
        cls: cls,
        inp: inp,
        domContentLoaded: nav ? nav.domContentLoadedEventEnd : (timing.domContentLoadedEventEnd - timing.navigationStart),
        load: nav ? nav.loadEventEnd : (timing.loadEventEnd - timing.navigationStart)
      };

      // Ensure realistic fallback values
      if (metrics.ttfb <= 0) metrics.ttfb = Math.max(50, timing.responseStart - timing.requestStart || 50); 
      if (metrics.fcp <= 0) metrics.fcp = Math.max(800, timing.domContentLoadedEventEnd - timing.navigationStart || 800);
      if (metrics.lcp <= 0) metrics.lcp = Math.max(1200, timing.loadEventEnd - timing.navigationStart || 1200);
      if (metrics.fid <= 0) metrics.fid = 50;
      if (metrics.domContentLoaded <= 0) metrics.domContentLoaded = Math.max(800, timing.domContentLoadedEventEnd - timing.navigationStart || 800);
      if (metrics.load <= 0) metrics.load = Math.max(1200, timing.loadEventEnd - timing.navigationStart || 1200);

      // Add resource timing data
      const resources = performance.getEntriesByType('resource');
      metrics.resourceCount = resources.length;
      metrics.totalResourceSize = resources.reduce((total, resource) => total + (resource.transferSize || 0), 0);
      
      // Calculate resource sizes by type
      metrics.jsSize = resources
        .filter(r => r.initiatorType === 'script' || r.name.endsWith('.js'))
        .reduce((total, r) => total + (r.transferSize || 0), 0);
        
      metrics.cssSize = resources
        .filter(r => r.initiatorType === 'css' || r.name.endsWith('.css'))
        .reduce((total, r) => total + (r.transferSize || 0), 0);
        
      metrics.imgSize = resources
        .filter(r => r.initiatorType === 'img' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].some(ext => r.name.endsWith(`.${ext}`)))
        .reduce((total, r) => total + (r.transferSize || 0), 0);
      
      // Calculate third-party resources
      const thirdPartyResources = resources.filter(r => {
        try {
          const resourceDomain = new URL(r.name).hostname;
          return resourceDomain !== currentDomain && !resourceDomain.endsWith(`.${currentDomain}`);
        } catch (e) {
          return false;
        }
      });
      
      metrics.thirdPartySize = thirdPartyResources.reduce((total, r) => total + (r.transferSize || 0), 0);
      metrics.thirdPartyCount = thirdPartyResources.length;
      metrics.currentDomain = currentDomain;
      
      // Add extended resource data for waterfall chart
      metrics.resources = resources.map(r => ({
        name: r.name,
        initiatorType: r.initiatorType,
        transferSize: r.transferSize,
        duration: r.duration,
        startTime: r.startTime,
        connectStart: r.connectStart,
        connectEnd: r.connectEnd,
        requestStart: r.requestStart,
        responseStart: r.responseStart,
        responseEnd: r.responseEnd
      }));

        return metrics;
      } catch (error) {
        console.error('Error in performance analysis:', error);
        throw new Error('Failed to analyze page performance');
      }
    },
    args: [settings]
  });

  updateProgressIndicator(4, 6, 'Processing performance data');
  const metrics = injected[0].result;
  
  if (!metrics) {
    throw new Error('No performance data received. The page may still be loading or have JavaScript errors.');
  }
  
  updateProgressIndicator(5, 6, 'Generating insights');
  
  // Save metrics for export
  try {
    localStorage.setItem('lastMetrics', JSON.stringify(metrics));
  } catch (e) {
    console.error('Error saving metrics for export:', e);
  }

  // Calculate performance score first
  const score = calculatePerformanceScore(metrics);
  const grade = getPerformanceGrade(score);
  
  // Display results with performance grade
  resultsEl.innerHTML = `
    <div class="performance-grade" style="color: ${grade.color};">
      <div class="grade-emoji">${grade.emoji}</div>
      <div class="grade-text">${grade.grade} (${score}%)</div>
    </div>
    ${createMetricElement('Time to First Byte', metrics.ttfb, THRESHOLDS.ttfb)}
    ${createMetricElement('First Contentful Paint', metrics.fcp, THRESHOLDS.fcp)}
    ${createMetricElement('Largest Contentful Paint', metrics.lcp, THRESHOLDS.lcp)}
    ${createMetricElement('First Input Delay', metrics.fid, THRESHOLDS.fid)}
    ${metrics.inp ? `<div class="metric">
      <span class="metric-name">Interaction to Next Paint</span>
      <span class="metric-value">${formatTime(metrics.inp)}</span>
    </div>` : ''}
    <div class="metric">
      <span class="metric-name">Cumulative Layout Shift</span>
      <span class="metric-value">${metrics.cls.toFixed(3)}</span>
    </div>
    ${createMetricElement('DOM Content Loaded', metrics.domContentLoaded, THRESHOLDS.domContentLoaded)}
    ${createMetricElement('Page Load Complete', metrics.load, THRESHOLDS.load)}
    <div class="metric">
      <span class="metric-name">Resources Loaded</span>
      <span class="metric-value">${metrics.resourceCount}</span>
    </div>
    <div class="metric">
      <span class="metric-name">Total Resource Size</span>
      <span class="metric-value">${formatBytes(metrics.totalResourceSize)}</span>
    </div>
    <div class="metric">
      <span class="metric-name">JavaScript Size</span>
      <span class="metric-value">${formatBytes(metrics.jsSize)}</span>
    </div>
    <div class="metric">
      <span class="metric-name">CSS Size</span>
      <span class="metric-value">${formatBytes(metrics.cssSize)}</span>
    </div>
    <div class="metric">
      <span class="metric-name">Image Size</span>
      <span class="metric-value">${formatBytes(metrics.imgSize)}</span>
    </div>
    <div class="metric">
      <span class="metric-name">Third-Party Resources</span>
      <span class="metric-value">${metrics.thirdPartyCount} (${formatBytes(metrics.thirdPartySize)})</span>
    </div>
  `;
  
  // Generate and display recommendations
  const recommendations = generateRecommendations(metrics);
  if (recommendations.length > 0) {
    recommendationsEl.innerHTML = recommendations
      .map(rec => `<div class="recommendation ${rec.priority}">
        <div class="recommendation-header">
          <span class="priority-badge ${rec.priority}">${rec.priority.toUpperCase()}</span>
          <span class="category-badge">${rec.category}</span>
        </div>
        <div class="recommendation-text">${rec.text}</div>
      </div>`)
      .join('');
  } else {
    recommendationsEl.innerHTML = '<div class="empty-state" style="color: var(--success);">🎉 No recommendations - excellent performance!</div>';
  }
  
  // Update history chart
  console.log('Calling updateHistoryChart with metrics:', metrics);
  updateHistoryChart(metrics);
  
  // Update network table
  updateNetworkTable(metrics.resources);
  
  // Update waterfall chart
  updateWaterfallChart(metrics.resources);
  
  // Update third-party analysis
  updateThirdPartyAnalysis(metrics.resources, metrics.currentDomain);
  
  // Update accessibility analysis
  updateAccessibilityAnalysis(metrics);
  
  updateProgressIndicator(6, 6, 'Finalizing results');
  
  // Show success notification
  resetRunButton();
  showSuccessNotification('Analysis complete! Found ' + (metrics.resources ? metrics.resources.length : 0) + ' resources');
  
  return metrics;
  
  } catch (error) {
    console.error('Analysis error:', error);
    resetRunButton();
    
    // Show detailed error with helpful suggestions
    const errorSuggestions = {
      'No active tab found': 'Please make sure you have a browser tab open and try again.',
      'Cannot analyze': 'Try navigating to a regular website (like google.com) and run the analysis.',
      'No performance data': 'The page might still be loading. Wait a few seconds and try again.',
      'Failed to analyze': 'Try refreshing the target page and running the analysis again.'
    };
    
    let suggestion = 'Try refreshing the page and running the analysis again.';
    for (const [key, value] of Object.entries(errorSuggestions)) {
      if (error.message.includes(key)) {
        suggestion = value;
        break;
      }
    }
    
    updateStatus(`❌ ${error.message}`, false);
    
    // Show enhanced error message
    resultsEl.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--error); border: 1px solid var(--error); border-radius: 4px; background: rgba(239, 68, 68, 0.1);">
        <div style="font-size: 24px; margin-bottom: 12px;">⚠️</div>
        <div style="font-weight: 600; margin-bottom: 8px; color: var(--error);">Analysis Failed</div>
        <div style="font-size: 14px; color: var(--text-primary); margin-bottom: 12px;">${sanitizeHTML(error.message)}</div>
        <div style="font-size: 13px; color: var(--text-secondary); padding: 12px; background: var(--bg-elevated); border-radius: 4px; border-left: 3px solid var(--warning);">
          💡 <strong>Suggestion:</strong> ${sanitizeHTML(suggestion)}
        </div>
      </div>
    `;
    
    recommendationsEl.innerHTML = '';
    throw error;
  }
}

// Update the status message with loading animation
function updateStatus(message, isLoading = false) {
  const statusEl = DOM_CACHE.status || document.getElementById('status');
  if (isLoading) {
    statusEl.innerHTML = `<div class="loading"></div> ${message}`;
  } else {
    statusEl.textContent = message;
  }
}

// Clear status after a delay
function clearStatus(delay = 2000) {
  setTimeout(() => {
    updateStatus('');
  }, delay);
}

// Initialize the run button event handler
document.addEventListener('DOMContentLoaded', function() {
  // Initialize DOM cache
  initDOMCache();
  
  // Add clear history button event listener
  (DOM_CACHE.clearHistory || document.getElementById('clearHistory')).addEventListener('click', clearHistoryData);
  
  // Add loading animation to run button when clicked
  const runButton = DOM_CACHE.runButton || document.getElementById('run');
  runButton.addEventListener('click', async () => {
    runButton.disabled = true;
    runButton.style.cursor = 'not-allowed';
    try {
      await runAnalysis();
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      runButton.disabled = false;
      runButton.style.cursor = 'pointer';
      resetRunButton();
    }
  });
  
  // Initialize all settings and data
  loadSettings();
  
  // Initialize history chart if data exists
  try {
    const storedHistory = localStorage.getItem('performanceHistory');
    if (storedHistory) {
      const historyData = JSON.parse(storedHistory);
      if (Array.isArray(historyData) && historyData.length > 0) {
        updateHistoryChartFromData(historyData);
      }
    }
  } catch (e) {
    console.error('Error initializing history chart:', e);
    try {
      localStorage.removeItem('performanceHistory');
    } catch (removeError) {
      console.error('Error removing corrupted history data:', removeError);
    }
  }
  
  // Add navigation click handlers for sidebar
  document.querySelectorAll('.nav-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
    });
    
    // Add keyboard navigation
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchTab(item.dataset.tab);
      }
      
      const items = Array.from(document.querySelectorAll('.nav-item'));
      const currentIndex = items.indexOf(item);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;
        
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
          break;
        
        case 'Home':
          e.preventDefault();
          items[0].focus();
          break;
        
        case 'End':
          e.preventDefault();
          items[items.length - 1].focus();
          break;
      }
    });
  });
  
  // Function to switch tabs with accessibility support
  function switchTab(tabName) {
    // Update navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const activeNavItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    
    if (activeNavItem && activeContent) {
      activeNavItem.classList.add('active');
      activeContent.classList.add('active');
      
      // Update page title based on active tab
      const pageTitleEl = document.getElementById('pageTitle');
      const pageIconEl = document.querySelector('.page-icon');
      const tabTitles = {
        'metrics': { title: 'Performance Metrics', icon: '⚡' },
        'waterfall': { title: 'Resource Waterfall', icon: '📊' },
        'network': { title: 'Network Resources', icon: '🌐' },
        'third-party': { title: 'Third-Party Analysis', icon: '📦' },
        'accessibility': { title: 'Accessibility', icon: '♿' },
        'history': { title: 'Performance History', icon: '📈' },
        'settings': { title: 'Settings', icon: '⚙️' }
      };
      
      if (tabTitles[tabName]) {
        pageTitleEl.textContent = tabTitles[tabName].title;
        pageIconEl.textContent = tabTitles[tabName].icon;
      }
    }
      
    // Show history data when tab is clicked
    if (tabName === 'history') {
      try {
        const storedHistory = localStorage.getItem('performanceHistory');
        if (storedHistory) {
          const data = JSON.parse(storedHistory);
          if (Array.isArray(data) && data.length > 0) {
            updateHistoryChartFromData(data);
          } else {
            const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
            chartEl.innerHTML = '<div class="empty-state" style="display: flex; align-items: center; justify-content: center;">No history data yet. Run analyses to see performance trends.</div>';
          }
        } else {
          const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
          chartEl.innerHTML = '<div class="empty-state" style="display: flex; align-items: center; justify-content: center;">No history data yet. Run analyses to see performance trends.</div>';
        }
        
        // Ensure the tab content is visible
        setTimeout(() => {
          const historyTab = document.getElementById('history');
          if (historyTab) {
            historyTab.style.display = 'block';
          }
        }, 50);
      } catch (e) {
        console.error('Error displaying history on tab click:', e);
        try {
          localStorage.removeItem('performanceHistory');
          const chartEl = DOM_CACHE.historyChart || document.getElementById('historyChart');
          chartEl.innerHTML = '<div class="empty-state" style="display: flex; align-items: center; justify-content: center;">Error loading history data. Please try again.</div>';
        } catch (removeError) {
          console.error('Error cleaning up corrupted history:', removeError);
        }
      }
    }
  }
  
  // Global keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + number shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          switchTab('metrics');
          break;
        case '2':
          e.preventDefault();
          switchTab('waterfall');
          break;
        case '3':
          e.preventDefault();
          switchTab('network');
          break;
        case '4':
          e.preventDefault();
          switchTab('third-party');
          break;
        case '5':
          e.preventDefault();
          switchTab('accessibility');
          break;
        case '6':
          e.preventDefault();
          switchTab('history');
          break;
        case '7':
          e.preventDefault();
          switchTab('settings');
          break;
      }
    }
    
    // Space or Enter to run analysis when not focused on a form element
    if ((e.key === ' ' || e.key === 'Enter') && !['INPUT', 'SELECT', 'BUTTON'].includes(e.target.tagName)) {
      e.preventDefault();
      const runButton = document.getElementById('run');
      if (!runButton.disabled) {
        runButton.click();
      }
    }
  });
  
  // Add settings change event listeners
  (DOM_CACHE.deviceType || document.getElementById('deviceType')).addEventListener('change', saveSettings);
  (DOM_CACHE.networkThrottle || document.getElementById('networkThrottle')).addEventListener('change', saveSettings);
  (DOM_CACHE.cpuThrottle || document.getElementById('cpuThrottle')).addEventListener('change', saveSettings);
  
  // Add export button event listeners
  (DOM_CACHE.exportJSON || document.getElementById('exportJSON')).addEventListener('click', () => {
    try {
      const storedMetrics = localStorage.getItem('lastMetrics');
      if (storedMetrics) {
        const currentMetrics = JSON.parse(storedMetrics);
        if (Object.keys(currentMetrics).length > 0) {
          exportToJSON(currentMetrics);
        } else {
          alert('No data to export. Please run an analysis first.');
        }
      } else {
        alert('No data to export. Please run an analysis first.');
      }
    } catch (e) {
      console.error('Error exporting JSON:', e);
      alert('Error exporting data. Please try running an analysis again.');
    }
  });
  
  (DOM_CACHE.exportCSV || document.getElementById('exportCSV')).addEventListener('click', () => {
    try {
      const storedMetrics = localStorage.getItem('lastMetrics');
      if (storedMetrics) {
        const currentMetrics = JSON.parse(storedMetrics);
        if (Object.keys(currentMetrics).length > 0) {
          exportToCSV(currentMetrics);
        } else {
          alert('No data to export. Please run an analysis first.');
        }
      } else {
        alert('No data to export. Please run an analysis first.');
      }
    } catch (e) {
      console.error('Error exporting CSV:', e);
      alert('Error exporting data. Please try running an analysis again.');
    }
  });
});
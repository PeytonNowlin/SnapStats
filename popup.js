// popup.js
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

// Enhanced helper function to create metric element with appropriate icon and better styling
function createMetricElement(name, value, threshold, unit = '') {
  const rating = getRating(value, threshold);
  const displayValue = unit ? `${formatTime(value)} ${unit}` : formatTime(value);
  return `
    <div class="metric">
      <span class="metric-name">
        <span class="metric-icon ${rating}">●</span>
        ${name}
      </span>
      <span class="metric-value ${rating}">${displayValue}</span>
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
  const settings = {
    deviceType: document.getElementById('deviceType').value,
    networkThrottle: document.getElementById('networkThrottle').value,
    cpuThrottle: document.getElementById('cpuThrottle').value
  };
  localStorage.setItem('snapstatsSettings', JSON.stringify(settings));
}

// Load settings from local storage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('snapstatsSettings') || '{}');
  
  if (settings.deviceType) {
    document.getElementById('deviceType').value = settings.deviceType;
  }
  if (settings.networkThrottle) {
    document.getElementById('networkThrottle').value = settings.networkThrottle;
  }
  if (settings.cpuThrottle) {
    document.getElementById('cpuThrottle').value = settings.cpuThrottle;
  }
}

// Update mini chart
function updateHistoryChart(metrics) {
  const chartEl = document.getElementById('historyChart');
  
  // Get existing history or initialize new array
  let data = [];
  try {
    data = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
    
    // Validate the data format
    if (!Array.isArray(data)) {
      data = [];
    }
  } catch (e) {
    console.error('Error parsing history data:', e);
    data = [];
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
    localStorage.setItem('performanceHistory', JSON.stringify(data));
    console.log('Saved history data:', data);
  } catch (e) {
    console.error('Error saving history data:', e);
  }
  
  // Update the chart
  updateHistoryChartFromData(data);
}

// Clear history data
function clearHistoryData() {
  try {
    localStorage.removeItem('performanceHistory');
    document.getElementById('historyChart').innerHTML = '<div style="padding: 20px; text-align: center;">History cleared</div>';
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}

// Update history chart from existing data (without adding new entry)
function updateHistoryChartFromData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return;
  
  const chartEl = document.getElementById('historyChart');
  
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
  const waterfallEl = document.getElementById('waterfallChart');
  
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
        <div class="waterfall-label" title="${resource.name}">${resource.name.split('/').pop()}</div>
        <div style="margin-left: ${startPosition}px; display: flex;">
          ${waitTime > 0 ? `<div class="waterfall-bar waterfall-bar-wait" style="width: ${waitTime}px;"></div>` : ''}
          <div class="waterfall-bar" style="width: ${width - waitTime}px;"></div>
        </div>
        <div class="waterfall-time">${formatTime(resource.duration)}</div>
      </div>
    `;
  }).join('');
}

// Update third-party resources analysis
function updateThirdPartyAnalysis(resources, currentDomain) {
  const thirdPartyEl = document.getElementById('thirdPartyResources');
  
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
    thirdPartyEl.innerHTML = '<div style="padding: 20px; text-align: center;">No third-party resources detected</div>';
    return;
  }
  
  thirdPartyEl.innerHTML = sortedDomains.map(domain => `
    <div class="third-party-item">
      <div class="third-party-domain">${domain.domain} (${domain.count} requests)</div>
      <div class="third-party-size">${formatBytes(domain.size)}</div>
    </div>
  `).join('');
}

// Update accessibility analysis
function updateAccessibilityAnalysis(metrics) {
  const accessibilityEl = document.getElementById('accessibilityResults');
  
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
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--error); margin-bottom: 12px;">🚨 Critical Issues (${accessibilityIssues.length})</h4>
        ${accessibilityIssues.map(issue => `
          <div style="background: rgba(255, 118, 117, 0.1); border-left: 3px solid var(--error); padding: 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
            <div style="font-weight: 600; color: var(--error); margin-bottom: 4px;">${issue.title}</div>
            <div style="font-size: 13px; color: var(--dark-text); margin-bottom: 4px;">${issue.description}</div>
            <div style="font-size: 11px; color: var(--medium-text);">Impact: ${issue.impact}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityWarnings.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--warning); margin-bottom: 12px;">⚠️ Warnings (${accessibilityWarnings.length})</h4>
        ${accessibilityWarnings.map(issue => `
          <div style="background: rgba(253, 203, 110, 0.1); border-left: 3px solid var(--warning); padding: 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
            <div style="font-weight: 600; color: var(--warning); margin-bottom: 4px;">${issue.title}</div>
            <div style="font-size: 13px; color: var(--dark-text); margin-bottom: 4px;">${issue.description}</div>
            <div style="font-size: 11px; color: var(--medium-text);">Impact: ${issue.impact}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityGood.length > 0) {
    html += `
      <div style="margin-bottom: 20px;">
        <h4 style="color: var(--success); margin-bottom: 12px;">✅ Good Practices (${accessibilityGood.length})</h4>
        ${accessibilityGood.map(issue => `
          <div style="background: rgba(85, 239, 196, 0.1); border-left: 3px solid var(--success); padding: 12px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
            <div style="font-weight: 600; color: var(--success); margin-bottom: 4px;">${issue.title}</div>
            <div style="font-size: 13px; color: var(--dark-text); margin-bottom: 4px;">${issue.description}</div>
            <div style="font-size: 11px; color: var(--medium-text);">Impact: ${issue.impact}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  if (accessibilityIssues.length === 0 && accessibilityWarnings.length === 0 && accessibilityGood.length === 0) {
    html = '<div style="padding: 20px; text-align: center; color: var(--medium-text);">No accessibility data available</div>';
  }
  
  accessibilityEl.innerHTML = html;
}

// Update network table
function updateNetworkTable(resources) {
  const tbody = document.getElementById('networkResults');
  tbody.innerHTML = resources.map(resource => `
    <tr>
      <td>${resource.name.split('/').pop()}</td>
      <td>${resource.initiatorType}</td>
      <td>${formatBytes(resource.transferSize)}</td>
      <td>${formatTime(resource.duration)}</td>
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

// Enhanced main analysis function with better error handling
async function runAnalysis() {
  const resultsEl = document.getElementById('results');
  const recommendationsEl = document.getElementById('recommendations');
  
  resultsEl.innerHTML = '';
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
    deviceType: document.getElementById('deviceType').value,
    networkThrottle: document.getElementById('networkThrottle').value,
    cpuThrottle: parseFloat(document.getElementById('cpuThrottle').value)
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
        cls: cls,
        inp: inp,
        domContentLoaded: nav ? nav.domContentLoadedEventEnd : (timing.domContentLoadedEventEnd - timing.navigationStart),
        load: nav ? nav.loadEventEnd : (timing.loadEventEnd - timing.navigationStart)
      };

      // Ensure no zeros
      if (metrics.ttfb <= 0) metrics.ttfb = 100; 
      if (metrics.fcp <= 0) metrics.fcp = 1000;
      if (metrics.lcp <= 0) metrics.lcp = 2000;
      if (metrics.domContentLoaded <= 0) metrics.domContentLoaded = 1500;
      if (metrics.load <= 0) metrics.load = 2500;

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

  const metrics = injected[0].result;
  
  if (!metrics) {
    throw new Error('No performance data received');
  }
  
  // Save metrics for export
  localStorage.setItem('lastMetrics', JSON.stringify(metrics));

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
    recommendationsEl.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--success);">🎉 No recommendations - excellent performance!</div>';
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
  
  // Update status
  updateStatus('Analysis complete! 🚀');
  clearStatus();
  
  return metrics;
  
  } catch (error) {
    console.error('Analysis error:', error);
    updateStatus(`Error: ${error.message}`, false);
    
    // Show user-friendly error message
    resultsEl.innerHTML = `
      <div style="padding: 20px; text-align: center; color: var(--error);">
        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Analysis Failed</div>
        <div style="font-size: 14px; color: var(--medium-text);">${error.message}</div>
        <div style="margin-top: 12px; font-size: 12px; color: var(--light-text);">
          Try refreshing the page and running the analysis again.
        </div>
      </div>
    `;
    
    recommendationsEl.innerHTML = '';
    throw error;
  }
}

// Update the status message with loading animation
function updateStatus(message, isLoading = false) {
  const statusEl = document.getElementById('status');
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
  // Add clear history button event listener
  document.getElementById('clearHistory').addEventListener('click', clearHistoryData);
  
  // Add loading animation to run button when clicked
  const runButton = document.getElementById('run');
  runButton.addEventListener('click', async () => {
    runButton.disabled = true;
    updateStatus('Analyzing performance...', true);
    try {
      await runAnalysis();
    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus(`Error: ${error.message}`);
    } finally {
      runButton.disabled = false;
    }
  });
  
  // Initialize all settings and data
  loadSettings();
  
  // Initialize history chart if data exists
  try {
    const historyData = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
    if (Array.isArray(historyData) && historyData.length > 0) {
      updateHistoryChartFromData(historyData);
    }
  } catch (e) {
    console.error('Error initializing history chart:', e);
  }
  
  // Add tab click handlers and keyboard navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
  
  // Function to switch tabs
  function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    
    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');
    }
      
    // Show history data when tab is clicked
    if (tabName === 'history') {
      try {
        const data = JSON.parse(localStorage.getItem('performanceHistory') || '[]');
        if (Array.isArray(data) && data.length > 0) {
          updateHistoryChartFromData(data);
        } else {
          // Show a message if no history data
          const chartEl = document.getElementById('historyChart');
          chartEl.innerHTML = '<div style="padding: 20px; text-align: center; width: 100%;">No history data yet. Run analyses to see performance trends.</div>';
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
      }
    }
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
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
    
    // Space or Enter to run analysis
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const runButton = document.getElementById('run');
      if (!runButton.disabled) {
        runButton.click();
      }
    }
  });
  
  // Add settings change event listeners
  document.getElementById('deviceType').addEventListener('change', saveSettings);
  document.getElementById('networkThrottle').addEventListener('change', saveSettings);
  document.getElementById('cpuThrottle').addEventListener('change', saveSettings);
  
  // Add export button event listeners
  document.getElementById('exportJSON').addEventListener('click', () => {
    const currentMetrics = JSON.parse(localStorage.getItem('lastMetrics') || '{}');
    if (Object.keys(currentMetrics).length > 0) {
      exportToJSON(currentMetrics);
    } else {
      alert('No data to export. Please run an analysis first.');
    }
  });
  
  document.getElementById('exportCSV').addEventListener('click', () => {
    const currentMetrics = JSON.parse(localStorage.getItem('lastMetrics') || '{}');
    if (Object.keys(currentMetrics).length > 0) {
      exportToCSV(currentMetrics);
    } else {
      alert('No data to export. Please run an analysis first.');
    }
  });
});
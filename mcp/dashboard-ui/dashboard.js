// Dashboard JavaScript
class KlintMCPDashboard {
  constructor() {
    this.socket = null;
    this.currentTool = null;
    this.stats = {
      totalCalls: 0,
      toolCalls: {},
      recentCalls: [],
      serverHealth: "unknown",
      uptime: 0,
    };

    this.init();
  }

  init() {
    this.connectSocket();
    this.loadInitialData();
    this.setupEventListeners();
  }

  connectSocket() {
    this.socket = io();

    this.socket.on("connect", () => {
      console.log("Connected to dashboard server");
      this.updateConnectionStatus(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from dashboard server");
      this.updateConnectionStatus(false);
    });

    this.socket.on("statsUpdate", (stats) => {
      this.updateStats(stats);
    });

    this.socket.on("healthUpdate", (health) => {
      this.updateHealthStatus(health);
    });

    this.socket.on("toolCall", (callInfo) => {
      this.addActivityItem(callInfo);
    });
  }

  setupEventListeners() {
    // Close modal on background click
    document
      .getElementById("toolTesterModal")
      .addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
          this.closeToolTester();
        }
      });

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeToolTester();
      }
    });
  }

  async loadInitialData() {
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/health"),
      ]);

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        this.updateStats(stats);
      }

      if (healthResponse.ok) {
        const health = await healthResponse.json();
        this.updateHealthStatus(health);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }

  updateStats(stats) {
    this.stats = { ...this.stats, ...stats };

    // Update stat cards
    document.getElementById("totalCalls").textContent = stats.totalCalls;
    document.getElementById("uptime").textContent = this.formatUptime(
      stats.uptime
    );

    // Calculate success rate
    const successful = stats.recentCalls.filter((call) => call.success).length;
    const total = stats.recentCalls.length;
    const successRate =
      total > 0 ? Math.round((successful / total) * 100) : 100;
    document.getElementById("successRate").textContent = `${successRate}%`;

    // Update tool call counts
    Object.entries(stats.toolCalls).forEach(([tool, count]) => {
      const toolCard = document.querySelector(`[data-tool="${tool}"]`);
      if (toolCard) {
        const countElement = toolCard.querySelector(".call-count");
        countElement.textContent = `${count} calls`;
      }
    });

    // Update recent activity
    this.updateRecentActivity(stats.recentCalls);
  }

  updateHealthStatus(health) {
    const indicator = document.getElementById("healthIndicator");
    const statusText = indicator.querySelector(".status-text");

    // Remove existing classes
    indicator.classList.remove("healthy", "unhealthy", "unknown");

    if (health.healthy) {
      indicator.classList.add("healthy");
      statusText.textContent = "Healthy";
    } else {
      indicator.classList.add("unhealthy");
      statusText.textContent = `${health.status || "Unhealthy"}`;
    }
  }

  updateConnectionStatus(connected) {
    // Could add connection status indicator if needed
  }

  updateRecentActivity(recentCalls) {
    const activityLog = document.getElementById("activityLog");

    if (recentCalls.length === 0) {
      activityLog.innerHTML = `
        <div class="activity-item placeholder">
          <div class="activity-icon">💤</div>
          <div class="activity-content">
            <div class="activity-text">No recent activity</div>
            <div class="activity-time">Waiting for tool calls...</div>
          </div>
        </div>
      `;
      return;
    }

    const items = recentCalls
      .slice(0, 10)
      .map((call) => {
        const icon = call.success ? "✅" : "❌";
        const statusClass = call.success ? "success" : "error";
        const time = new Date(call.timestamp).toLocaleTimeString();

        return `
        <div class="activity-item ${statusClass}">
          <div class="activity-icon">${icon}</div>
          <div class="activity-content">
            <div class="activity-text">
              ${call.tool} ${call.success ? "completed" : "failed"}
              ${
                call.duration
                  ? `<span class="activity-duration">${call.duration}ms</span>`
                  : ""
              }
            </div>
            <div class="activity-time">${time}</div>
          </div>
        </div>
      `;
      })
      .join("");

    activityLog.innerHTML = items;
  }

  addActivityItem(callInfo) {
    // Add real-time activity updates
    const activityLog = document.getElementById("activityLog");
    const placeholder = activityLog.querySelector(".placeholder");

    if (placeholder) {
      placeholder.remove();
    }

    const icon = callInfo.success ? "✅" : "❌";
    const statusClass = callInfo.success ? "success" : "error";
    const time = new Date().toLocaleTimeString();

    const itemHTML = `
      <div class="activity-item ${statusClass}">
        <div class="activity-icon">${icon}</div>
        <div class="activity-content">
          <div class="activity-text">
            ${callInfo.tool} ${callInfo.success ? "completed" : "failed"}
            ${
              callInfo.duration
                ? `<span class="activity-duration">${callInfo.duration}ms</span>`
                : ""
            }
          </div>
          <div class="activity-time">${time}</div>
        </div>
      </div>
    `;

    activityLog.insertAdjacentHTML("afterbegin", itemHTML);

    // Keep only recent items
    const items = activityLog.querySelectorAll(".activity-item");
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  openToolTester(toolName) {
    this.currentTool = toolName;
    const modal = document.getElementById("toolTesterModal");
    const modalTitle = document.getElementById("modalTitle");
    const toolForm = document.getElementById("toolForm");
    const toolResult = document.getElementById("toolResult");

    modalTitle.textContent = `Test ${toolName}`;
    toolResult.style.display = "none";

    // Generate form based on tool
    toolForm.innerHTML = this.generateToolForm(toolName);

    modal.classList.add("show");
  }

  closeToolTester() {
    const modal = document.getElementById("toolTesterModal");
    modal.classList.remove("show");
    this.currentTool = null;
  }

  generateToolForm(toolName) {
    const forms = {
      "how-do-i": `
        <div class="form-group">
          <label for="task">Task (required)</label>
          <input type="text" id="task" placeholder="e.g., create animated particles" required>
        </div>
        <div class="form-group">
          <label for="context">Context (optional)</label>
          <textarea id="context" placeholder="Additional context about your project"></textarea>
        </div>
      `,
      explain: `
        <div class="form-group">
          <label for="function">Function Name (required)</label>
          <input type="text" id="function" placeholder="e.g., circle, translate, fillColor" required>
        </div>
        <div class="form-group">
          <label for="includeExamples">Include Examples</label>
          <select id="includeExamples">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      `,
      debug: `
        <div class="form-group">
          <label for="code">Code (required)</label>
          <textarea id="code" placeholder="Paste your Klint code here" required style="min-height: 120px;"></textarea>
        </div>
        <div class="form-group">
          <label for="issue">Issue Description (optional)</label>
          <input type="text" id="issue" placeholder="e.g., animation is slow, circles not showing">
        </div>
      `,
      "ship-it": `
        <div class="form-group">
          <label for="code">Code (required)</label>
          <textarea id="code" placeholder="Paste your Klint sketch code here" required style="min-height: 120px;"></textarea>
        </div>
        <div class="form-group">
          <label for="target">Target Format</label>
          <select id="target">
            <option value="react-component">React Component</option>
            <option value="standalone">Standalone App</option>
            <option value="npm-package">NPM Package</option>
          </select>
        </div>
      `,
    };

    return forms[toolName] || "<p>Form not available for this tool.</p>";
  }

  async testTool() {
    if (!this.currentTool) return;

    const testBtn = document.getElementById("testToolBtn");
    const toolResult = document.getElementById("toolResult");

    // Disable button and show loading
    testBtn.disabled = true;
    testBtn.textContent = "Running...";

    try {
      // Collect form data
      const formData = this.collectFormData();

      // Call API
      const response = await fetch(`/api/tools/${this.currentTool}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      // Show result
      this.showToolResult(result);
    } catch (error) {
      this.showToolResult({
        success: false,
        error: error.message,
      });
    } finally {
      // Re-enable button
      testBtn.disabled = false;
      testBtn.textContent = "Run Tool";
    }
  }

  collectFormData() {
    const formData = {};
    const form = document.getElementById("toolForm");
    const inputs = form.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        formData[input.id] = input.checked;
      } else if (input.value.trim()) {
        let value = input.value.trim();

        // Convert string booleans to actual booleans
        if (value === "true") value = true;
        if (value === "false") value = false;

        formData[input.id] = value;
      }
    });

    return formData;
  }

  showToolResult(result) {
    const toolResult = document.getElementById("toolResult");
    const statusElement = toolResult.querySelector(".result-status");
    const durationElement = toolResult.querySelector(".result-duration");
    const textElement = toolResult.querySelector(".result-text");

    // Update status
    statusElement.className =
      "result-status " + (result.success ? "success" : "error");
    statusElement.textContent = result.success ? "Success" : "Error";

    // Update duration
    if (result.duration) {
      durationElement.textContent = `${result.duration}ms`;
      durationElement.style.display = "inline-block";
    } else {
      durationElement.style.display = "none";
    }

    // Update result text
    textElement.textContent = result.success ? result.result : result.error;

    toolResult.style.display = "block";
    toolResult.scrollIntoView({ behavior: "smooth" });
  }
}

// Global functions for HTML onclick handlers
function checkHealth() {
  fetch("/api/health")
    .then((response) => response.json())
    .then((health) => {
      dashboard.updateHealthStatus(health);
    })
    .catch((error) => {
      console.error("Health check failed:", error);
    });
}

function openToolTester(toolName) {
  dashboard.openToolTester(toolName);
}

function closeToolTester() {
  dashboard.closeToolTester();
}

function testTool() {
  dashboard.testTool();
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new KlintMCPDashboard();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = KlintMCPDashboard;
}

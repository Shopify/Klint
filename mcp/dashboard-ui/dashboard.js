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

  // Utility function to escape HTML
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
      return String(unsafe);
    }
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Create DOM element safely
  createElement(tag, className, textContent) {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (textContent) elem.textContent = textContent;
    return elem;
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
    
    // Clear existing content
    while (activityLog.firstChild) {
      activityLog.removeChild(activityLog.firstChild);
    }

    if (recentCalls.length === 0) {
      const placeholder = this.createElement("div", "activity-item placeholder");
      const icon = this.createElement("div", "activity-icon", "💤");
      const content = this.createElement("div", "activity-content");
      const text = this.createElement("div", "activity-text", "No recent activity");
      const time = this.createElement("div", "activity-time", "Waiting for tool calls...");
      
      content.appendChild(text);
      content.appendChild(time);
      placeholder.appendChild(icon);
      placeholder.appendChild(content);
      activityLog.appendChild(placeholder);
      return;
    }

    const fragment = document.createDocumentFragment();
    
    recentCalls.slice(0, 10).forEach((call) => {
      const icon = call.success ? "✅" : "❌";
      const statusClass = call.success ? "success" : "error";
      const time = new Date(call.timestamp).toLocaleTimeString();

      const item = this.createElement("div", `activity-item ${statusClass}`);
      const iconDiv = this.createElement("div", "activity-icon", icon);
      const content = this.createElement("div", "activity-content");
      const textDiv = this.createElement("div", "activity-text");
      
      // Create text content safely
      textDiv.textContent = `${call.tool} ${call.success ? "completed" : "failed"}`;
      
      if (call.duration) {
        textDiv.textContent += " ";
        const duration = this.createElement("span", "activity-duration", `${call.duration}ms`);
        textDiv.appendChild(duration);
      }
      
      const timeDiv = this.createElement("div", "activity-time", time);
      
      content.appendChild(textDiv);
      content.appendChild(timeDiv);
      item.appendChild(iconDiv);
      item.appendChild(content);
      fragment.appendChild(item);
    });

    activityLog.appendChild(fragment);
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

    // Create new activity item using safe DOM methods
    const item = this.createElement("div", `activity-item ${statusClass}`);
    const iconDiv = this.createElement("div", "activity-icon", icon);
    const content = this.createElement("div", "activity-content");
    const textDiv = this.createElement("div", "activity-text");
    
    // Create text content safely
    textDiv.textContent = `${callInfo.tool} ${callInfo.success ? "completed" : "failed"}`;
    
    if (callInfo.duration) {
      textDiv.textContent += " ";
      const duration = this.createElement("span", "activity-duration", `${callInfo.duration}ms`);
      textDiv.appendChild(duration);
    }
    
    const timeDiv = this.createElement("div", "activity-time", time);
    
    content.appendChild(textDiv);
    content.appendChild(timeDiv);
    item.appendChild(iconDiv);
    item.appendChild(content);
    
    // Insert at the beginning
    activityLog.insertBefore(item, activityLog.firstChild);

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

    modalTitle.textContent = `Test ${this.escapeHtml(toolName)}`;
    toolResult.style.display = "none";

    // Clear previous form content
    while (toolForm.firstChild) {
      toolForm.removeChild(toolForm.firstChild);
    }

    // Generate form based on tool using DOM methods
    this.createToolForm(toolName, toolForm);

    modal.classList.add("show");
  }

  closeToolTester() {
    const modal = document.getElementById("toolTesterModal");
    modal.classList.remove("show");
    this.currentTool = null;
  }

  createToolForm(toolName, container) {
    const formConfigs = {
      "klint-patterns": [
        {
          type: "input",
          id: "task",
          label: "Task (required)",
          placeholder: "e.g., create animated particles",
          required: true
        },
        {
          type: "textarea",
          id: "context",
          label: "Context (optional)",
          placeholder: "Additional context about your project"
        }
      ],
      explain: [
        {
          type: "input",
          id: "function",
          label: "Function Name (required)",
          placeholder: "e.g., circle, translate, fillColor",
          required: true
        },
        {
          type: "select",
          id: "includeExamples",
          label: "Include Examples",
          options: [
            { value: "true", text: "Yes" },
            { value: "false", text: "No" }
          ]
        }
      ],
      debug: [
        {
          type: "textarea",
          id: "code",
          label: "Code (required)",
          placeholder: "Paste your Klint code here",
          required: true,
          style: "min-height: 120px;"
        },
        {
          type: "input",
          id: "issue",
          label: "Issue Description (optional)",
          placeholder: "e.g., animation is slow, circles not showing"
        }
      ],
      "ship-it": [
        {
          type: "textarea",
          id: "code",
          label: "Code (required)",
          placeholder: "Paste your Klint sketch code here",
          required: true,
          style: "min-height: 120px;"
        },
        {
          type: "select",
          id: "target",
          label: "Target Format",
          options: [
            { value: "react-component", text: "React Component" },
            { value: "standalone", text: "Standalone App" },
            { value: "npm-package", text: "NPM Package" }
          ]
        }
      ]
    };

    const config = formConfigs[toolName];
    if (!config) {
      const p = document.createElement("p");
      p.textContent = "Form not available for this tool.";
      container.appendChild(p);
      return;
    }

    config.forEach(field => {
      const formGroup = document.createElement("div");
      formGroup.className = "form-group";

      const label = document.createElement("label");
      label.htmlFor = field.id;
      label.textContent = field.label;
      formGroup.appendChild(label);

      if (field.type === "input") {
        const input = document.createElement("input");
        input.type = "text";
        input.id = field.id;
        input.placeholder = field.placeholder || "";
        if (field.required) input.required = true;
        formGroup.appendChild(input);
      } else if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.id = field.id;
        textarea.placeholder = field.placeholder || "";
        if (field.required) textarea.required = true;
        if (field.style) textarea.style.cssText = field.style;
        formGroup.appendChild(textarea);
      } else if (field.type === "select") {
        const select = document.createElement("select");
        select.id = field.id;
        field.options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt.value;
          option.textContent = opt.text;
          select.appendChild(option);
        });
        formGroup.appendChild(select);
      }

      container.appendChild(formGroup);
    });
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

        // Validate field length for strings
        if (typeof value === 'string' && value.length > 10000) {
          console.warn(`Input truncated: ${input.id} exceeded 10000 characters`);
          value = value.substring(0, 10000);
        }

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

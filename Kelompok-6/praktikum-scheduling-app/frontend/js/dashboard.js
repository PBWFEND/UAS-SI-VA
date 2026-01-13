class Dashboard {
  constructor() {
    this.apiBaseUrl = "/api";
    this.initialize();
  }

  async initialize() {
    await this.loadUserInfo();
    await this.loadDashboardData();
    await this.loadTodaySchedules();
    await this.loadUpcomingSchedules();
    this.setupEventListeners();
  }

  async loadUserInfo() {
    try {
      const user = await auth.getCurrentUser();
      if (user) {
        document.getElementById("userName").textContent = user.name;
        document.getElementById("userRole").textContent = user.role;
      }
    } catch (error) {
      console.error("Error loading user info:", error);
      this.showAlert("Error loading user information", "error");
    }
  }

  async loadDashboardData() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/stats/dashboard`, {
        credentials: "include",
      });

      if (response.ok) {
        const stats = await response.json();
        this.updateDashboardStats(stats);
      } else {
        // Fallback to mock data if API fails
        this.updateDashboardStats({
          totalSchedules: 24,
          totalGroups: 12,
          todaySchedules: 3,
          attendanceRate: 85,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Use mock data for demo
      this.updateDashboardStats({
        totalSchedules: 24,
        totalGroups: 12,
        todaySchedules: 3,
        attendanceRate: 85,
      });
    }
  }

  updateDashboardStats(stats) {
    document.getElementById("totalSchedules").textContent =
      stats.totalSchedules || 0;
    document.getElementById("totalGroups").textContent = stats.totalGroups || 0;
    document.getElementById("upcomingSchedules").textContent =
      stats.todaySchedules || 0;
    document.getElementById("attendanceRate").textContent = `${
      stats.attendanceRate || 0
    }%`;
  }

  async loadTodaySchedules() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${this.apiBaseUrl}/schedules?date=${today}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const schedules = await response.json();
        this.renderTodaySchedules(schedules);

        // Update date display
        const dateElement = document.getElementById("currentDate");
        if (dateElement) {
          dateElement.textContent = this.formatDateLong(today);
          dateElement.dataset.date = today;
        }
      }
    } catch (error) {
      console.error("Error loading today schedules:", error);
      this.renderTodaySchedules([]);
    }
  }

  async loadUpcomingSchedules() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/schedules/upcoming`, {
        credentials: "include",
      });

      if (response.ok) {
        const schedules = await response.json();
        this.renderUpcomingSchedules(schedules);
      }
    } catch (error) {
      console.error("Error loading upcoming schedules:", error);
      this.renderUpcomingSchedules([]);
    }
  }

  renderTodaySchedules(schedules) {
    const container = document.getElementById("dateSchedules");
    if (!container) return;

    if (schedules.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            Tidak ada jadwal untuk hari ini.
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    container.innerHTML = schedules
      .map(
        (schedule) => `
            <tr>
                <td>${schedule.start_time} - ${schedule.end_time}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="color-indicator" style="background-color: ${
                          schedule.color_code || "#3b82f6"
                        }; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></div>
                        ${schedule.praktikum_name || "Praktikum"}
                    </div>
                </td>
                <td>${schedule.group_name || "-"}</td>
                <td>${schedule.room || "Lab"}</td>
                <td>
                    <span class="badge ${
                      schedule.status === "completed"
                        ? "badge-success"
                        : schedule.status === "cancelled"
                        ? "badge-danger"
                        : "badge-warning"
                    }">
                        ${schedule.status || "scheduled"}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.viewSchedule(${
                          schedule.id
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="dashboard.takeAttendance(${
                          schedule.id
                        })">
                            <i class="fas fa-clipboard-check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `
      )
      .join("");
  }

  renderUpcomingSchedules(schedules) {
    const container = document.getElementById("upcomingSchedulesList");
    if (!container) return;

    if (schedules.length === 0) {
      container.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    Tidak ada jadwal mendatang.
                </div>
            `;
      return;
    }

    // Show only next 5 schedules
    const upcoming = schedules.slice(0, 5);

    container.innerHTML = upcoming
      .map(
        (schedule) => `
            <div class="schedule-item" style="background-color: ${
              schedule.color_code || "#3b82f6"
            }" 
                 onclick="dashboard.viewSchedule(${schedule.id})">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${
                          schedule.praktikum_name || "Praktikum"
                        }</strong>
                        <div class="small">${
                          schedule.group_name
                        } • ${this.formatDate(schedule.schedule_date)} • ${
          schedule.start_time
        }</div>
                    </div>
                    <span class="badge ${
                      schedule.status === "completed"
                        ? "badge-success"
                        : "badge-warning"
                    }">
                        ${schedule.status || "scheduled"}
                    </span>
                </div>
            </div>
        `
      )
      .join("");
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  formatDateLong(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  setupEventListeners() {
    // Quick action buttons
    document.getElementById("quickSchedule")?.addEventListener("click", () => {
      window.location.href = "/scheduling";
    });

    document
      .getElementById("quickAttendance")
      ?.addEventListener("click", () => {
        window.location.href = "/attendance";
      });

    document.getElementById("quickReport")?.addEventListener("click", () => {
      window.location.href = "/reports";
    });

    // Date navigation
    document.getElementById("prevDate")?.addEventListener("click", () => {
      this.navigateDate(-1);
    });

    document.getElementById("nextDate")?.addEventListener("click", () => {
      this.navigateDate(1);
    });

    // Refresh button
    document
      .getElementById("refreshDashboard")
      ?.addEventListener("click", () => {
        this.refreshDashboard();
      });
  }

  async navigateDate(direction) {
    const dateElement = document.getElementById("currentDate");
    let currentDate = new Date(
      dateElement.dataset.date || new Date().toISOString().split("T")[0]
    );
    currentDate.setDate(currentDate.getDate() + direction);

    const formattedDate = currentDate.toISOString().split("T")[0];

    // Update display
    dateElement.textContent = this.formatDateLong(formattedDate);
    dateElement.dataset.date = formattedDate;

    // Load schedules for new date
    await this.loadSchedulesForDate(formattedDate);
  }

  async loadSchedulesForDate(date) {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/schedules?date=${date}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const schedules = await response.json();
        this.renderTodaySchedules(schedules);
      }
    } catch (error) {
      console.error("Error loading date schedules:", error);
      this.showAlert("Error loading schedules", "error");
    }
  }

  async refreshDashboard() {
    const refreshBtn = document.getElementById("refreshDashboard");
    const originalText = refreshBtn.innerHTML;

    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="spinner"></span> Loading...';

    await this.loadDashboardData();
    await this.loadTodaySchedules();
    await this.loadUpcomingSchedules();

    refreshBtn.disabled = false;
    refreshBtn.innerHTML = originalText;
    this.showAlert("Dashboard diperbarui!", "success");
  }

  viewSchedule(scheduleId) {
    window.location.href = `/scheduling.html#view-${scheduleId}`;
  }

  async takeAttendance(scheduleId) {
    window.location.href = `/attendance.html#schedule-${scheduleId}`;
  }

  showAlert(message, type = "info") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            ${message}
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
        `;

    document.querySelector("main").prepend(alert);

    setTimeout(() => {
      if (alert.parentElement) alert.remove();
    }, 5000);
  }
}

// Initialize dashboard
let dashboard;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dashboardContent")) {
    dashboard = new Dashboard();
  }
});

class Scheduling {
  constructor() {
    this.apiBaseUrl = "/api";
    this.categories = [];
    this.groups = [];
    this.schedules = [];
    this.currentDate = new Date();
    this.initialize();
  }

  async initialize() {
    await this.loadUserInfo();
    await this.loadCategories();
    await this.loadGroups();
    await this.loadSchedules();
    this.setupCalendar();
    this.setupEventListeners();
    this.updateStatistics();

    // Check for hash in URL (for viewing specific schedule)
    this.checkUrlHash();
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
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`, {
        credentials: "include",
      });

      if (response.ok) {
        this.categories = await response.json();
        this.populateCategorySelect();
        this.populateCategoryColors();
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      this.showAlert("Error loading categories", "error");
    }
  }

  async loadGroups() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/groups`, {
        credentials: "include",
      });

      if (response.ok) {
        this.groups = await response.json();
        this.populateGroupSelect();
      }
    } catch (error) {
      console.error("Error loading groups:", error);
      this.showAlert("Error loading groups", "error");
    }
  }

  async loadSchedules() {
    try {
      const year = this.currentDate.getFullYear();
      const month = (this.currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");

      const response = await fetch(
        `${this.apiBaseUrl}/calendar/${year}/${month}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const calendarData = await response.json();
        this.schedules = [];

        // Convert calendar data to flat array
        Object.values(calendarData).forEach((daySchedules) => {
          this.schedules = this.schedules.concat(daySchedules);
        });

        this.renderSchedulesTable();
        this.updateCalendar();
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      this.showAlert("Error loading schedules", "error");
    }
  }

  populateCategorySelect() {
    const select = document.getElementById("praktikumCategory");
    if (!select) return;

    select.innerHTML =
      '<option value="">Pilih Kategori Praktikum</option>' +
      this.categories
        .map(
          (cat) => `
                <option value="${cat.id}" data-color="${cat.color_code}">
                    ${cat.name} (Maks: ${cat.max_participants} peserta)
                </option>
            `
        )
        .join("");
  }

  populateCategoryColors() {
    const container = document.getElementById("categoryColors");
    if (!container) return;

    const colors = [
      "#3b82f6",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#6366f1",
    ];

    container.innerHTML = colors
      .map(
        (color) => `
            <div class="color-option" style="background-color: ${color}" data-color="${color}"></div>
        `
      )
      .join("");

    // Add event listeners to color options
    container.querySelectorAll(".color-option").forEach((option) => {
      option.addEventListener("click", () => {
        container.querySelectorAll(".color-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        option.classList.add("selected");

        // Update category color if editing
        const categoryId = document.getElementById("scheduleId").value;
        if (categoryId) {
          // This would update the category color in a real implementation
        }
      });
    });
  }

  populateGroupSelect() {
    const select = document.getElementById("groupSelect");
    if (!select) return;

    select.innerHTML =
      '<option value="">Pilih Kelompok</option>' +
      this.groups
        .map(
          (group) => `
                <option value="${group.id}">
                    ${group.group_name} (${group.member_count} anggota) - ${group.praktikum_name}
                </option>
            `
        )
        .join("");
  }

  renderSchedulesTable() {
    const container = document.getElementById("schedulesTable");
    if (!container) return;

    // Sort schedules by date
    const sortedSchedules = [...this.schedules].sort(
      (a, b) => new Date(a.schedule_date) - new Date(b.schedule_date)
    );

    if (sortedSchedules.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            Belum ada jadwal untuk periode ini.
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    container.innerHTML = sortedSchedules
      .map(
        (schedule) => `
            <tr>
                <td>${this.formatDate(schedule.schedule_date)}<br>
                    <small>${schedule.day}</small>
                </td>
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
                <td>${schedule.instructor || "-"}</td>
                <td>
                    <span class="badge ${
                      schedule.status === "completed"
                        ? "badge-success"
                        : schedule.status === "cancelled"
                        ? "badge-danger"
                        : schedule.status === "postponed"
                        ? "badge-info"
                        : "badge-warning"
                    }">
                        ${schedule.status || "scheduled"}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="scheduling.editSchedule(${
                          schedule.id
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="scheduling.deleteSchedule(${
                          schedule.id
                        })">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="scheduling.takeAttendance(${
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

  setupCalendar() {
    this.renderCalendar();
    this.updateCalendarHeader();
  }

  renderCalendar() {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();

    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Day headers
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    let calendarHTML = "";

    // Render day headers
    dayNames.forEach((day) => {
      calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before first day of month
    for (let i = 0; i < startingDay; i++) {
      calendarHTML += '<div class="calendar-day"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();

      // Get schedules for this day
      const daySchedules = this.getSchedulesForDate(dateString);

      let dayClass = "calendar-day";
      if (isToday) dayClass += " today";
      if (daySchedules.length > 0) dayClass += " has-schedule";

      calendarHTML += `
                <div class="${dayClass}" data-date="${dateString}">
                    <div class="day-number">${day}</div>
                    ${daySchedules
                      .slice(0, 2)
                      .map(
                        (schedule) => `
                        <div class="schedule-item" style="background-color: ${
                          schedule.color_code
                        }" 
                             onclick="scheduling.viewDaySchedules('${dateString}')"
                             title="${schedule.praktikum_name} - ${
                          schedule.start_time
                        }">
                            ${schedule.praktikum_name.substring(0, 10)}...
                        </div>
                    `
                      )
                      .join("")}
                    ${
                      daySchedules.length > 2
                        ? `<div class="schedule-item text-center" onclick="scheduling.viewDaySchedules('${dateString}')">
                            +${daySchedules.length - 2} lebih
                        </div>`
                        : ""
                    }
                </div>
            `;
    }

    calendar.innerHTML = calendarHTML;
  }

  updateCalendarHeader() {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const monthName = monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();

    document.getElementById(
      "currentMonth"
    ).textContent = `${monthName} ${year}`;
  }

  getSchedulesForDate(dateString) {
    if (!this.schedules) return [];
    return this.schedules.filter(
      (schedule) => schedule.schedule_date === dateString
    );
  }

  updateCalendar() {
    // Highlight days with schedules
    const calendarDays = document.querySelectorAll(".calendar-day");
    calendarDays.forEach((day) => {
      const date = day.dataset.date;
      if (date) {
        const schedules = this.getSchedulesForDate(date);
        if (schedules.length > 0) {
          day.classList.add("has-schedule");
        }
      }
    });
  }

  updateStatistics() {
    const totalScheduled = this.schedules.length;
    const completedSchedules = this.schedules.filter(
      (s) => s.status === "completed"
    ).length;
    const upcomingSchedules = this.schedules.filter(
      (s) => s.status === "scheduled" && new Date(s.schedule_date) >= new Date()
    ).length;
    const cancelledSchedules = this.schedules.filter(
      (s) => s.status === "cancelled"
    ).length;

    document.getElementById("totalScheduled").textContent = totalScheduled;
    document.getElementById("completedSchedules").textContent =
      completedSchedules;
    document.getElementById("upcomingSchedules").textContent =
      upcomingSchedules;
    document.getElementById("cancelledSchedules").textContent =
      cancelledSchedules;
  }

  async addSchedule(scheduleData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(scheduleData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert(
          result.message || "Jadwal berhasil ditambahkan",
          "success"
        );
        this.closeModal();
        await this.loadSchedules();
        return true;
      } else {
        throw new Error(result.error || "Failed to add schedule");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
      return false;
    }
  }

  async editSchedule(id) {
    const schedule = this.schedules.find((s) => s.id === id);
    if (!schedule) {
      this.showAlert("Jadwal tidak ditemukan", "error");
      return;
    }

    // Load category and group data
    await this.loadCategories();
    await this.loadGroups();

    // Fill modal with schedule data
    document.getElementById("scheduleId").value = schedule.id;
    document.getElementById("praktikumCategory").value = schedule.praktikum_id;
    document.getElementById("groupSelect").value = schedule.group_id;
    document.getElementById("scheduleDate").value = schedule.schedule_date;
    document.getElementById("daySelect").value = schedule.day;
    document.getElementById("startTime").value = schedule.start_time;
    document.getElementById("endTime").value = schedule.end_time;
    document.getElementById("room").value = schedule.room || "";
    document.getElementById("instructor").value = schedule.instructor || "";
    document.getElementById("statusSelect").value =
      schedule.status || "scheduled";
    document.getElementById("scheduleNotes").value = schedule.notes || "";

    document.getElementById("modalTitle").textContent = "Edit Jadwal";
    document.getElementById("scheduleModal").style.display = "flex";
  }

  async updateSchedule(id, scheduleData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(scheduleData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert("Jadwal berhasil diperbarui", "success");
        this.closeModal();
        await this.loadSchedules();
        return true;
      } else {
        throw new Error(result.error || "Failed to update schedule");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
      return false;
    }
  }

  async deleteSchedule(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/schedules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert("Jadwal berhasil dihapus", "success");
        await this.loadSchedules();
      } else {
        throw new Error(result.error || "Failed to delete schedule");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
    }
  }

  async takeAttendance(scheduleId) {
    window.location.href = `/attendance.html#schedule-${scheduleId}`;
  }

  viewDaySchedules(dateString) {
    const daySchedules = this.getSchedulesForDate(dateString);

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Jadwal ${this.formatDate(dateString)}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    ${
                      daySchedules.length === 0
                        ? '<p class="text-center">Tidak ada jadwal</p>'
                        : daySchedules
                            .map(
                              (schedule) => `
                            <div class="card mb-2">
                                <div class="card-body">
                                    <h5 class="card-title">${
                                      schedule.praktikum_name
                                    }</h5>
                                    <p class="card-text">
                                        <i class="fas fa-clock"></i> ${
                                          schedule.start_time
                                        } - ${schedule.end_time}<br>
                                        <i class="fas fa-users"></i> ${
                                          schedule.group_name
                                        }<br>
                                        <i class="fas fa-door-open"></i> ${
                                          schedule.room || "Lab"
                                        }<br>
                                        <i class="fas fa-chalkboard-teacher"></i> ${
                                          schedule.instructor || "-"
                                        }
                                    </p>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-primary" onclick="scheduling.editSchedule(${
                                          schedule.id
                                        })">
                                            Edit
                                        </button>
                                        <button class="btn btn-sm btn-success" onclick="scheduling.takeAttendance(${
                                          schedule.id
                                        })">
                                            Kehadiran
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `
                            )
                            .join("")
                    }
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Tutup</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    modal.style.display = "flex";
  }

  setupEventListeners() {
    // New schedule button
    document.getElementById("newScheduleBtn")?.addEventListener("click", () => {
      this.openNewScheduleModal();
    });

    // New group button
    document.getElementById("newGroupBtn")?.addEventListener("click", () => {
      this.openNewGroupModal();
    });

    // New category button
    document.getElementById("newCategoryBtn")?.addEventListener("click", () => {
      this.openNewCategoryModal();
    });

    // Schedule form submit
    document
      .getElementById("scheduleForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleScheduleSubmit();
      });

    // Group form submit
    document
      .getElementById("groupForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleGroupSubmit();
      });

    // Category form submit
    document
      .getElementById("categoryForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleCategorySubmit();
      });

    // Calendar navigation
    document.getElementById("prevMonth")?.addEventListener("click", () => {
      this.navigateMonth(-1);
    });

    document.getElementById("nextMonth")?.addEventListener("click", () => {
      this.navigateMonth(1);
    });

    document.getElementById("todayBtn")?.addEventListener("click", () => {
      this.goToToday();
    });

    // View toggle
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Time slot selection
    document.querySelectorAll(".time-slot").forEach((slot) => {
      slot.addEventListener("click", (e) => {
        const time = e.target.dataset.time;
        const isStart = e.target.closest("#morningSlots");

        if (isStart) {
          document.getElementById("startTime").value = time;
          document.getElementById("endTime").value = this.calculateEndTime(
            time,
            2
          );
        } else {
          document.getElementById("endTime").value = time;
        }

        // Update selected state
        e.target
          .closest(".time-slots")
          .querySelectorAll(".time-slot")
          .forEach((s) => {
            s.classList.remove("selected");
          });
        e.target.classList.add("selected");
      });
    });

    // Close modal buttons
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.closeModal());
    });

    document
      .getElementById("closeScheduleModal")
      ?.addEventListener("click", () => {
        this.closeModal();
      });

    document
      .getElementById("closeGroupModal")
      ?.addEventListener("click", () => {
        this.closeModal();
      });

    document
      .getElementById("closeCategoryModal")
      ?.addEventListener("click", () => {
        this.closeModal();
      });

    // Window click to close modal
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal();
      }
    });

    // Refresh button
    document
      .getElementById("refreshSchedules")
      ?.addEventListener("click", () => {
        this.refreshSchedules();
      });
  }

  openNewScheduleModal() {
    document.getElementById("modalTitle").textContent = "Jadwal Baru";
    document.getElementById("scheduleForm").reset();
    document.getElementById("scheduleId").value = "";
    document.getElementById("scheduleDate").value = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("daySelect").value = this.getDayName(new Date());
    document.getElementById("startTime").value = "08:00";
    document.getElementById("endTime").value = "10:00";
    document.getElementById("statusSelect").value = "scheduled";
    document.getElementById("scheduleModal").style.display = "flex";
  }

  openNewGroupModal() {
    document.getElementById("groupForm").reset();
    document.getElementById("groupPraktikum").innerHTML =
      '<option value="">Pilih Kategori</option>' +
      this.categories
        .map((cat) => `<option value="${cat.id}">${cat.name}</option>`)
        .join("");
    document.getElementById("memberCount").value = 5;
    document.getElementById("groupModal").style.display = "flex";
  }

  openNewCategoryModal() {
    document.getElementById("categoryForm").reset();
    document.getElementById("maxParticipants").value = 20;
    document.getElementById("durationHours").value = 2;
    document.getElementById("categoryModal").style.display = "flex";
  }

  async handleScheduleSubmit() {
    const formData = new FormData(document.getElementById("scheduleForm"));
    const scheduleId = formData.get("scheduleId");

    const scheduleData = {
      praktikum_id: formData.get("praktikumCategory"),
      group_id: formData.get("groupSelect"),
      schedule_date: formData.get("scheduleDate"),
      day: formData.get("daySelect"),
      start_time: formData.get("startTime"),
      end_time: formData.get("endTime"),
      room: formData.get("room"),
      instructor: formData.get("instructor"),
      status: formData.get("statusSelect"),
      notes: formData.get("scheduleNotes"),
    };

    // Validate
    if (
      !scheduleData.praktikum_id ||
      !scheduleData.group_id ||
      !scheduleData.schedule_date
    ) {
      this.showAlert("Harap isi semua field yang diperlukan", "error");
      return;
    }

    if (scheduleId) {
      await this.updateSchedule(scheduleId, scheduleData);
    } else {
      await this.addSchedule(scheduleData);
    }
  }

  async handleGroupSubmit() {
    const formData = new FormData(document.getElementById("groupForm"));

    const groupData = {
      group_name: formData.get("groupName"),
      praktikum_id: formData.get("groupPraktikum"),
      member_count: formData.get("memberCount"),
      leader_name: formData.get("leaderName"),
      contact: formData.get("contact"),
      notes: formData.get("groupDescription"),
    };

    if (
      !groupData.group_name ||
      !groupData.praktikum_id ||
      !groupData.member_count
    ) {
      this.showAlert(
        "Harap isi nama kelompok, kategori, dan jumlah anggota",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(groupData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert(
          result.message || "Kelompok berhasil ditambahkan",
          "success"
        );
        this.closeModal();
        await this.loadGroups(); // Reload groups
      } else {
        throw new Error(result.error || "Failed to add group");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
    }
  }

  async handleCategorySubmit() {
    const formData = new FormData(document.getElementById("categoryForm"));
    const selectedColor =
      document.querySelector(".color-picker .color-option.selected")?.dataset
        .color || "#3b82f6";

    const categoryData = {
      name: formData.get("categoryName"),
      description: formData.get("categoryDescription"),
      max_participants: formData.get("maxParticipants"),
      duration_hours: formData.get("durationHours"),
      color_code: selectedColor,
    };

    if (!categoryData.name) {
      this.showAlert("Nama kategori diperlukan", "error");
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert(
          result.message || "Kategori berhasil ditambahkan",
          "success"
        );
        this.closeModal();
        await this.loadCategories(); // Reload categories
      } else {
        throw new Error(result.error || "Failed to add category");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
    }
  }

  navigateMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.updateCalendarHeader();
    this.renderCalendar();
    this.loadSchedules();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateCalendarHeader();
    this.renderCalendar();
    this.loadSchedules();
  }

  switchView(view) {
    // Update active button
    document.querySelectorAll("[data-view]").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");

    // In a full implementation, this would switch between month/week/day views
    this.showAlert(`Berpindah ke tampilan ${view}`, "info");
  }

  calculateEndTime(startTime, durationHours = 2) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours + durationHours, minutes);

    return (
      endDate.getHours().toString().padStart(2, "0") +
      ":" +
      endDate.getMinutes().toString().padStart(2, "0")
    );
  }

  getDayName(date) {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[date.getDay()];
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async refreshSchedules() {
    const refreshBtn = document.getElementById("refreshSchedules");
    const originalText = refreshBtn.innerHTML;

    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="spinner"></span> Loading...';

    await this.loadSchedules();

    refreshBtn.disabled = false;
    refreshBtn.innerHTML = originalText;
    this.showAlert("Jadwal diperbarui!", "success");
  }

  checkUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#view-")) {
      const scheduleId = hash.replace("#view-", "");
      this.editSchedule(parseInt(scheduleId));
    }
  }

  closeModal() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none";
    });
  }

  showAlert(message, type = "info") {
    // Remove existing alerts
    const existingAlert = document.querySelector(".alert:not(.d-none)");
    if (existingAlert) existingAlert.remove();

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

// Initialize scheduling
let scheduling;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("schedulingContent")) {
    scheduling = new Scheduling();
  }
});

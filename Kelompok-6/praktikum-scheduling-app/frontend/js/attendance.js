class Attendance {
  constructor() {
    this.apiBaseUrl = "/api";
    this.schedules = [];
    this.attendanceRecords = [];
    this.categories = [];
    this.initialize();
  }

  async initialize() {
    await this.loadUserInfo();
    await this.loadCategories();
    await this.loadAttendanceData();
    this.setupEventListeners();
    this.setupDateFilters();

    // Check for hash in URL
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
      this.showAlert("Error loading user information", "error");
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`, {
        credentials: "include",
      });

      if (response.ok) {
        this.categories = await response.json();
        this.populateCategoryFilter();
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      this.showAlert("Error loading categories", "error");
    }
  }

  async loadAttendanceData() {
    try {
      // Load recent schedules (last 7 days)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const dateFilter = sevenDaysAgo.toISOString().split("T")[0];

      // Load schedules that need attendance
      const schedulesResponse = await fetch(
        `${this.apiBaseUrl}/schedules?date=${dateFilter}`,
        {
          credentials: "include",
        }
      );

      if (schedulesResponse.ok) {
        this.schedules = await schedulesResponse.json();

        // Load attendance records for these schedules
        await this.loadAttendanceRecords();

        this.renderAttendanceTable();
        this.updateStatistics();
      }
    } catch (error) {
      console.error("Error loading attendance data:", error);
      this.showAlert("Error loading attendance data", "error");
    }
  }

  async loadAttendanceRecords() {
    try {
      const scheduleIds = this.schedules.map((s) => s.id).join(",");
      if (!scheduleIds) return;

      const response = await fetch(
        `${this.apiBaseUrl}/attendance?schedule_id=${scheduleIds}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        this.attendanceRecords = await response.json();
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
    }
  }

  populateCategoryFilter() {
    const select = document.getElementById("filterCategory");
    if (!select) return;

    select.innerHTML =
      '<option value="">Semua Kategori</option>' +
      this.categories
        .map(
          (cat) => `
                <option value="${cat.id}">${cat.name}</option>
            `
        )
        .join("");
  }

  setupDateFilters() {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    document.getElementById("filterDate").value = today
      .toISOString()
      .split("T")[0];
    document.getElementById("filterDate").max = today
      .toISOString()
      .split("T")[0];
    document.getElementById("filterDate").min = oneWeekAgo
      .toISOString()
      .split("T")[0];
  }

  renderAttendanceTable() {
    const container = document.getElementById("attendanceTable");
    if (!container) return;

    // Filter schedules (for demo, show all)
    const filteredSchedules = this.filterSchedules();

    if (filteredSchedules.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            Tidak ada jadwal untuk periode ini.
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    let html = "";
    filteredSchedules.forEach((schedule, index) => {
      const attendance = this.getAttendanceForSchedule(schedule.id);
      const isFilled = !!attendance;
      const attendanceRate = isFilled
        ? Math.round((attendance.present_count / schedule.member_count) * 100)
        : 0;

      html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <strong>${this.formatDate(
                          schedule.schedule_date
                        )}</strong><br>
                        <small>${schedule.day}, ${schedule.start_time} - ${
        schedule.end_time
      }</small>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="color-indicator" style="background-color: ${
                              schedule.color_code || "#3b82f6"
                            }; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px;"></div>
                            ${schedule.praktikum_name}
                        </div>
                    </td>
                    <td>${schedule.group_name}</td>
                    <td>${schedule.member_count} orang</td>
                    <td>
                        <span class="badge ${
                          isFilled ? "badge-success" : "badge-warning"
                        }">
                            ${isFilled ? "Sudah Diisi" : "Belum Diisi"}
                        </span>
                    </td>
                    <td>${isFilled ? attendance.present_count : "-"}</td>
                    <td>${isFilled ? attendance.absent_count : "-"}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" onclick="attendance.viewAttendance(${
                              schedule.id
                            })" ${!isFilled ? "disabled" : ""}>
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="attendance.openAttendanceModal(${
                              schedule.id
                            })">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="attendance.printAttendance(${
                              schedule.id
                            })">
                                <i class="fas fa-print"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
    });

    container.innerHTML = html;
  }

  filterSchedules() {
    const date = document.getElementById("filterDate").value;
    const category = document.getElementById("filterCategory").value;
    const status = document.getElementById("filterStatus").value;

    return this.schedules.filter((schedule) => {
      let match = true;

      if (date) {
        match = match && schedule.schedule_date === date;
      }

      if (category) {
        match = match && schedule.praktikum_id == category;
      }

      if (status === "hadir") {
        const attendance = this.getAttendanceForSchedule(schedule.id);
        match = match && !!attendance;
      } else if (status === "belum") {
        const attendance = this.getAttendanceForSchedule(schedule.id);
        match = match && !attendance;
      }

      return match;
    });
  }

  getAttendanceForSchedule(scheduleId) {
    return this.attendanceRecords.find(
      (record) => record.schedule_id === scheduleId
    );
  }

  async openAttendanceModal(scheduleId) {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      this.showAlert("Jadwal tidak ditemukan", "error");
      return;
    }

    // Load attendance data if exists
    let attendance = {};
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/attendance?schedule_id=${scheduleId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const records = await response.json();
        attendance = records[0] || {};
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }

    // Fill modal data
    document.getElementById("attendanceScheduleId").value = scheduleId;
    document.getElementById("attendanceGroupId").value = schedule.group_id;
    document.getElementById("praktikumId").value = schedule.praktikum_id;
    document.getElementById("attendanceDate").value = schedule.schedule_date;
    document.getElementById("praktikumName").value = schedule.praktikum_name;
    document.getElementById("groupName").value = schedule.group_name;
    document.getElementById("totalMembers").value = schedule.member_count;
    document.getElementById("presentCount").value =
      attendance.present_count || "";
    document.getElementById("absentCount").value =
      attendance.absent_count || "";
    document.getElementById("lateCount").value = attendance.late_count || "";
    document.getElementById("attendanceNotes").value = attendance.notes || "";

    // Calculate absent count if present count changes
    const presentInput = document.getElementById("presentCount");
    const absentInput = document.getElementById("absentCount");

    presentInput.oninput = (e) => {
      const total = schedule.member_count;
      const present = parseInt(e.target.value) || 0;
      const absent = total - present;
      absentInput.value = absent >= 0 ? absent : 0;
    };

    document.getElementById("attendanceModalTitle").textContent = attendance.id
      ? "Edit Kehadiran"
      : "Input Kehadiran";

    document.getElementById("attendanceModal").style.display = "flex";
  }

  async saveAttendance() {
    const scheduleId = document.getElementById("attendanceScheduleId").value;
    const groupId = document.getElementById("attendanceGroupId").value;
    const praktikumId = document.getElementById("praktikumId").value;
    const attendanceDate = document.getElementById("attendanceDate").value;
    const presentCount = document.getElementById("presentCount").value;
    const absentCount = document.getElementById("absentCount").value;
    const lateCount = document.getElementById("lateCount").value;
    const notes = document.getElementById("attendanceNotes").value;

    if (!presentCount || parseInt(presentCount) < 0) {
      this.showAlert("Harap masukkan jumlah hadir yang valid", "error");
      return;
    }

    const attendanceData = {
      schedule_id: scheduleId,
      group_id: groupId,
      praktikum_id: praktikumId,
      attendance_date: attendanceDate,
      present_count: parseInt(presentCount),
      absent_count: parseInt(absentCount) || 0,
      late_count: parseInt(lateCount) || 0,
      notes: notes,
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(attendanceData),
      });

      const result = await response.json();

      if (response.ok) {
        this.showAlert(
          result.message || "Kehadiran berhasil disimpan!",
          "success"
        );
        this.closeModal();
        await this.loadAttendanceData(); // Reload data
      } else {
        throw new Error(result.error || "Failed to save attendance");
      }
    } catch (error) {
      this.showAlert(error.message, "error");
    }
  }

  viewAttendance(scheduleId) {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    const attendance = this.getAttendanceForSchedule(scheduleId);

    if (!schedule || !attendance) {
      this.showAlert("Data kehadiran tidak ditemukan", "error");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Kehadiran</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${
                              schedule.praktikum_name
                            }</h5>
                            <p class="card-text">
                                <strong>Tanggal:</strong> ${this.formatDate(
                                  schedule.schedule_date
                                )}<br>
                                <strong>Waktu:</strong> ${
                                  schedule.start_time
                                } - ${schedule.end_time}<br>
                                <strong>Kelompok:</strong> ${
                                  schedule.group_name
                                }<br>
                                <strong>Ruangan:</strong> ${
                                  schedule.room || "Lab"
                                }<br>
                                <strong>Instruktur:</strong> ${
                                  schedule.instructor || "-"
                                }
                            </p>
                            <hr>
                            <h6>Data Kehadiran:</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="stat-card text-center">
                                        <h3 class="text-success">${
                                          attendance.present_count
                                        }</h3>
                                        <p>Hadir</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-card text-center">
                                        <h3 class="text-danger">${
                                          attendance.absent_count
                                        }</h3>
                                        <p>Tidak Hadir</p>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="stat-card text-center">
                                        <h3 class="text-warning">${
                                          attendance.late_count || 0
                                        }</h3>
                                        <p>Terlambat</p>
                                    </div>
                                </div>
                            </div>
                            <div class="progress mt-3" style="height: 25px;">
                                <div class="progress-bar bg-success" style="width: ${
                                  (attendance.present_count /
                                    schedule.member_count) *
                                  100
                                }%">
                                    ${Math.round(
                                      (attendance.present_count /
                                        schedule.member_count) *
                                        100
                                    )}%
                                </div>
                            </div>
                            ${
                              attendance.notes
                                ? `
                                <div class="mt-3">
                                    <strong>Catatan:</strong>
                                    <p>${attendance.notes}</p>
                                </div>
                            `
                                : ""
                            }
                            <div class="mt-3 text-muted">
                                <small>
                                    <i class="fas fa-user"></i> Diisi oleh: ${
                                      attendance.submitted_by || "System"
                                    }<br>
                                    <i class="fas fa-clock"></i> Waktu: ${this.formatDateTime(
                                      attendance.submitted_at
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Tutup</button>
                    <button type="button" class="btn btn-primary" onclick="attendance.openAttendanceModal(${scheduleId})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
    modal.style.display = "flex";
  }

  updateStatistics() {
    const totalScheduled = this.schedules.length;
    const attendanceFilled = this.schedules.filter((s) =>
      this.getAttendanceForSchedule(s.id)
    ).length;
    const attendancePending = totalScheduled - attendanceFilled;

    // Calculate average attendance rate
    let totalPresent = 0;
    let totalExpected = 0;

    this.attendanceRecords.forEach((att) => {
      totalPresent += att.present_count || 0;
      totalExpected += att.present_count + att.absent_count;
    });

    const attendanceRate =
      totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

    document.getElementById("totalScheduled").textContent = totalScheduled;
    document.getElementById("attendanceFilled").textContent = attendanceFilled;
    document.getElementById("attendancePending").textContent =
      attendancePending;
    document.getElementById(
      "attendanceRate"
    ).textContent = `${attendanceRate}%`;
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

  formatDateTime(dateTimeString) {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  setupEventListeners() {
    // Apply filter
    document
      .getElementById("applyFilter")
      ?.addEventListener("click", async () => {
        await this.applyFilters();
      });

    // Reset filter
    document.getElementById("resetFilter")?.addEventListener("click", () => {
      this.resetFilters();
    });

    // Bulk attendance
    document.getElementById("bulkAttendance")?.addEventListener("click", () => {
      this.openBulkAttendanceModal();
    });

    // Save attendance
    document.getElementById("saveAttendance")?.addEventListener("click", () => {
      this.saveAttendance();
    });

    // Close modal buttons
    document.querySelectorAll(".close-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.closeModal());
    });

    document
      .getElementById("closeAttendanceModal")
      ?.addEventListener("click", () => {
        this.closeModal();
      });

    document.getElementById("closeBulkModal")?.addEventListener("click", () => {
      this.closeModal();
    });

    // Present count slider for bulk attendance
    const defaultPresentSlider = document.getElementById("defaultPresent");
    if (defaultPresentSlider) {
      defaultPresentSlider.addEventListener("input", (e) => {
        document.getElementById(
          "presentPercentage"
        ).textContent = `${e.target.value}%`;
        this.updateBulkPreview();
      });
    }

    // Confirm bulk attendance
    document
      .getElementById("confirmBulkAttendance")
      ?.addEventListener("click", () => {
        this.saveBulkAttendance();
      });

    // Window click to close modal
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal();
      }
    });
  }

  async applyFilters() {
    this.renderAttendanceTable();
    this.updateStatistics();
    this.showAlert("Filter diterapkan!", "success");
  }

  resetFilters() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("filterDate").value = today;
    document.getElementById("filterCategory").value = "";
    document.getElementById("filterStatus").value = "";
    this.applyFilters();
    this.showAlert("Filter direset!", "info");
  }

  openBulkAttendanceModal() {
    document.getElementById("bulkDate").value = new Date()
      .toISOString()
      .split("T")[0];
    document.getElementById("bulkAttendanceModal").style.display = "flex";
    this.updateBulkPreview();
  }

  updateBulkPreview() {
    const date = document.getElementById("bulkDate").value;
    const percentage = document.getElementById("defaultPresent").value;

    // Get schedules for selected date that don't have attendance
    const schedulesForDate = this.schedules.filter(
      (schedule) =>
        schedule.schedule_date === date &&
        !this.getAttendanceForSchedule(schedule.id)
    );

    const previewBody = document.getElementById("bulkPreviewBody");
    if (previewBody) {
      if (schedulesForDate.length === 0) {
        previewBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            <div class="alert alert-info">
                                Tidak ada jadwal yang memerlukan input kehadiran untuk tanggal ini.
                            </div>
                        </td>
                    </tr>
                `;
        return;
      }

      previewBody.innerHTML = schedulesForDate
        .map((schedule) => {
          const presentCount = Math.round(
            schedule.member_count * (percentage / 100)
          );
          const absentCount = schedule.member_count - presentCount;

          return `
                    <tr>
                        <td>${schedule.start_time} - ${schedule.end_time}</td>
                        <td>${schedule.praktikum_name}</td>
                        <td>${schedule.group_name}</td>
                        <td>${presentCount}/${schedule.member_count} (${percentage}%)</td>
                    </tr>
                `;
        })
        .join("");
    }
  }

  async saveBulkAttendance() {
    const date = document.getElementById("bulkDate").value;
    const percentage = document.getElementById("defaultPresent").value;

    // Get schedules for selected date that don't have attendance
    const schedulesForDate = this.schedules.filter(
      (schedule) =>
        schedule.schedule_date === date &&
        !this.getAttendanceForSchedule(schedule.id)
    );

    if (schedulesForDate.length === 0) {
      this.showAlert(
        "Tidak ada jadwal yang memerlukan input kehadiran",
        "warning"
      );
      return;
    }

    // Save attendance for each schedule
    let savedCount = 0;
    let errorCount = 0;

    for (const schedule of schedulesForDate) {
      const presentCount = Math.round(
        schedule.member_count * (percentage / 100)
      );
      const absentCount = schedule.member_count - presentCount;

      const attendanceData = {
        schedule_id: schedule.id,
        group_id: schedule.group_id,
        praktikum_id: schedule.praktikum_id,
        attendance_date: date,
        present_count: presentCount,
        absent_count: absentCount,
        notes: "Diisi secara massal",
      };

      try {
        const response = await fetch(`${this.apiBaseUrl}/attendance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(attendanceData),
        });

        if (response.ok) {
          savedCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    this.closeModal();
    await this.loadAttendanceData();

    if (errorCount === 0) {
      this.showAlert(
        `Berhasil menyimpan kehadiran untuk ${savedCount} jadwal`,
        "success"
      );
    } else {
      this.showAlert(
        `Berhasil menyimpan ${savedCount} jadwal, gagal ${errorCount} jadwal`,
        "warning"
      );
    }
  }

  printAttendance(scheduleId) {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    const attendance = this.getAttendanceForSchedule(scheduleId);

    if (!schedule) return;

    const printWindow = window.open("", "_blank");
    const attendanceData = attendance
      ? `
            <h4>Data Kehadiran:</h4>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Hadir</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tidak Hadir</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Persentase</th>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      attendance.present_count
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${
                      attendance.absent_count
                    }</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${Math.round(
                      (attendance.present_count / schedule.member_count) * 100
                    )}%</td>
                </tr>
            </table>
            ${
              attendance.notes
                ? `<p><strong>Catatan:</strong> ${attendance.notes}</p>`
                : ""
            }
            <p><small>Diisi oleh: ${
              attendance.submitted_by || "System"
            } pada ${this.formatDateTime(attendance.submitted_at)}</small></p>
        `
      : "<p><em>Belum ada data kehadiran</em></p>";

    printWindow.document.write(`
            <html>
            <head>
                <title>Laporan Kehadiran - ${schedule.praktikum_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .subtitle { font-size: 16px; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
                    .progress-bar { 
                        height: 20px; 
                        background-color: #4CAF50; 
                        border-radius: 3px; 
                        margin: 10px 0; 
                        text-align: center; 
                        color: white; 
                        line-height: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">LAPORAN KEHADIRAN PRAKTIKUM</div>
                    <div class="subtitle">${schedule.praktikum_name}</div>
                </div>
                
                <h3>Informasi Jadwal</h3>
                <table>
                    <tr>
                        <th>Informasi</th>
                        <th>Detail</th>
                    </tr>
                    <tr>
                        <td>Nama Praktikum</td>
                        <td>${schedule.praktikum_name}</td>
                    </tr>
                    <tr>
                        <td>Kelompok</td>
                        <td>${schedule.group_name}</td>
                    </tr>
                    <tr>
                        <td>Tanggal</td>
                        <td>${this.formatDate(schedule.schedule_date)}</td>
                    </tr>
                    <tr>
                        <td>Waktu</td>
                        <td>${schedule.start_time} - ${schedule.end_time}</td>
                    </tr>
                    <tr>
                        <td>Ruangan</td>
                        <td>${schedule.room || "Lab"}</td>
                    </tr>
                    <tr>
                        <td>Instruktur</td>
                        <td>${schedule.instructor || "-"}</td>
                    </tr>
                    <tr>
                        <td>Jumlah Anggota</td>
                        <td>${schedule.member_count} orang</td>
                    </tr>
                </table>
                
                <h3>Data Kehadiran</h3>
                ${attendanceData}
                
                <div class="footer">
                    <p>Dicetak dari Aplikasi Penjadwalan Praktikum</p>
                    <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `);
    printWindow.document.close();
  }

  checkUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#schedule-")) {
      const scheduleId = hash.replace("#schedule-", "");
      this.openAttendanceModal(parseInt(scheduleId));
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

// Initialize attendance
let attendance;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("attendanceContent")) {
    attendance = new Attendance();
  }
});

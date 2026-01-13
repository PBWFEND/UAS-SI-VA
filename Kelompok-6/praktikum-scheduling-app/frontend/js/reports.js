class Reports {
  constructor() {
    this.apiBaseUrl = "/api";
    this.reportData = [];
    this.chart = null;
    this.initialize();
  }

  async initialize() {
    await this.loadUserInfo();
    await this.loadReportData();
    this.setupEventListeners();
    this.setupCharts();
    this.updateStatistics();
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

  async loadReportData() {
    try {
      const startDate = document.getElementById("reportStartDate").value;
      const endDate = document.getElementById("reportEndDate").value;

      const response = await fetch(
        `${this.apiBaseUrl}/reports?start_date=${startDate}&end_date=${endDate}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        this.reportData = await response.json();
        this.renderReportTable();
        this.updateCharts();
      }
    } catch (error) {
      console.error("Error loading report data:", error);
      this.showAlert("Error loading report data", "error");
    }
  }

  renderReportTable() {
    const container = document.getElementById("reportTable");
    if (!container) return;

    if (this.reportData.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle"></i>
                            Tidak ada data laporan untuk periode ini.
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    let html = "";
    this.reportData.forEach((item, index) => {
      const attendanceRate =
        item.member_count > 0
          ? Math.round(((item.present_count || 0) / item.member_count) * 100)
          : 0;

      html += `
                <tr>
                    <td>${this.formatDate(item.schedule_date)}</td>
                    <td>${item.praktikum_name}</td>
                    <td>${item.group_name}</td>
                    <td>${item.start_time} - ${item.end_time}</td>
                    <td>${item.present_count || 0}</td>
                    <td>${item.absent_count || 0}</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar ${
                              attendanceRate >= 80
                                ? "bg-success"
                                : attendanceRate >= 60
                                ? "bg-warning"
                                : "bg-danger"
                            }" 
                                 style="width: ${attendanceRate}%">
                                ${attendanceRate}%
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${
                          item.status === "completed"
                            ? "badge-success"
                            : item.status === "cancelled"
                            ? "badge-danger"
                            : "badge-warning"
                        }">
                            ${item.status}
                        </span>
                    </td>
                </tr>
            `;
    });

    container.innerHTML = html;
  }

  setupCharts() {
    const ctx = document.getElementById("attendanceChart").getContext("2d");

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
        datasets: [
          {
            label: "Rata-rata Kehadiran (%)",
            data: [85, 78, 92, 88, 76, 90],
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Kehadiran: ${context.raw}%`;
              },
            },
          },
        },
      },
    });
  }

  updateCharts() {
    if (!this.chart) return;

    // Update chart data based on report data
    // This is a simplified version - in real app, you'd process the data
    const monthlyData = this.calculateMonthlyAttendance();

    this.chart.data.labels = monthlyData.labels;
    this.chart.data.datasets[0].data = monthlyData.data;
    this.chart.update();
  }

  calculateMonthlyAttendance() {
    // Simplified monthly calculation
    // In real app, you'd process this.reportData
    return {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ],
      data: [85, 78, 92, 88, 76, 90, 82, 79, 88, 91, 85, 87],
    };
  }

  updateStatistics() {
    const totalSessions = this.reportData.length;
    const totalParticipants = this.reportData.reduce(
      (sum, item) => sum + (item.member_count || 0),
      0
    );

    const totalPresent = this.reportData.reduce(
      (sum, item) => sum + (item.present_count || 0),
      0
    );

    const avgAttendance =
      totalParticipants > 0
        ? Math.round((totalPresent / totalParticipants) * 100)
        : 0;

    const completedSessions = this.reportData.filter(
      (item) => item.status === "completed"
    ).length;

    const completionRate =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

    document.getElementById("totalSessions").textContent = totalSessions;
    document.getElementById("totalParticipants").textContent =
      totalParticipants;
    document.getElementById("avgAttendance").textContent = `${avgAttendance}%`;
    document.getElementById(
      "completionRate"
    ).textContent = `${completionRate}%`;
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  setupEventListeners() {
    // Generate report
    document
      .getElementById("generateReport")
      ?.addEventListener("click", async () => {
        await this.loadReportData();
      });

    // Export PDF
    document.getElementById("exportPDF")?.addEventListener("click", () => {
      this.exportPDF();
    });

    // Export Excel
    document.getElementById("exportExcel")?.addEventListener("click", () => {
      this.exportExcel();
    });

    // Print report
    document.getElementById("printReport")?.addEventListener("click", () => {
      this.printReport();
    });

    // Chart type change
    document.getElementById("chartType")?.addEventListener("change", (e) => {
      this.changeChartType(e.target.value);
    });

    // Toggle details
    document.getElementById("toggleDetails")?.addEventListener("click", () => {
      this.toggleDetails();
    });

    // Report cards
    document.querySelectorAll(".report-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".report-card")) return;
        this.showReportDetail(card.querySelector(".card-title").textContent);
      });
    });
  }

  exportPDF() {
    this.showAlert("Fitur export PDF sedang dikembangkan!", "info");
    // In real app, you would use a library like jsPDF or generate server-side PDF
  }

  exportExcel() {
    this.showAlert("Fitur export Excel sedang dikembangkan!", "info");
    // In real app, you would use a library like SheetJS
  }

  printReport() {
    const printContent = document.getElementById("reportsContent").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Praktikum - ${new Date().toLocaleDateString(
                  "id-ID"
                )}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 30px; }
                    .print-title { font-size: 24px; font-weight: bold; }
                    .print-subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .print-footer { margin-top: 50px; text-align: right; font-size: 12px; }
                    .no-print { display: none; }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <div class="print-title">LAPORAN PRAKTIKUM LABORATORIUM</div>
                    <div class="print-subtitle">
                        Periode: ${
                          document.getElementById("reportStartDate").value
                        } 
                        s/d ${document.getElementById("reportEndDate").value}
                    </div>
                </div>
                ${printContent}
                <div class="print-footer">
                    Dicetak pada: ${new Date().toLocaleString("id-ID")}<br>
                    Aplikasi Penjadwalan Praktikum &copy; 2026
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            document.body.innerHTML = originalContent;
                            location.reload();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `;
  }

  changeChartType(type) {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById("attendanceChart").getContext("2d");
    this.chart = new Chart(ctx, {
      type: type,
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
        datasets: [
          {
            label: "Rata-rata Kehadiran (%)",
            data: [85, 78, 92, 88, 76, 90],
            backgroundColor:
              type === "pie" || type === "doughnut"
                ? [
                    "#3b82f6",
                    "#10b981",
                    "#8b5cf6",
                    "#f59e0b",
                    "#ef4444",
                    "#ec4899",
                  ]
                : "rgba(59, 130, 246, 0.5)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  }

  toggleDetails() {
    const table = document.querySelector(".data-table");
    const button = document.getElementById("toggleDetails");

    if (table.style.maxHeight === "400px" || !table.style.maxHeight) {
      table.style.maxHeight = "none";
      button.innerHTML = '<i class="fas fa-compress"></i> Sembunyikan Detail';
    } else {
      table.style.maxHeight = "400px";
      button.innerHTML = '<i class="fas fa-expand"></i> Tampilkan Detail';
    }
  }

  showReportDetail(reportType) {
    let detailContent = "";

    switch (reportType) {
      case "Laporan per Kategori":
        detailContent = this.generateCategoryReport();
        break;
      case "Laporan Bulanan":
        detailContent = this.generateMonthlyReport();
        break;
      case "Laporan Instruktur":
        detailContent = this.generateInstructorReport();
        break;
      default:
        detailContent = "<p>Laporan detail tidak tersedia.</p>";
    }

    document.getElementById("reportDetailTitle").textContent = reportType;
    document.getElementById("reportDetailContent").innerHTML = detailContent;
    document.getElementById("reportDetailModal").style.display = "flex";
  }

  generateCategoryReport() {
    return `
            <h4>Analisis per Kategori Praktikum</h4>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Jumlah Sesi</th>
                            <th>Total Peserta</th>
                            <th>Rata-rata Kehadiran</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Praktikum Fisika Dasar</td>
                            <td>12</td>
                            <td>240</td>
                            <td>88%</td>
                            <td><span class="badge badge-success">Aktif</span></td>
                        </tr>
                        <tr>
                            <td>Praktikum Kimia Dasar</td>
                            <td>10</td>
                            <td>180</td>
                            <td>85%</td>
                            <td><span class="badge badge-success">Aktif</span></td>
                        </tr>
                        <tr>
                            <td>Praktikum Biologi</td>
                            <td>8</td>
                            <td>120</td>
                            <td>82%</td>
                            <td><span class="badge badge-success">Aktif</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
  }

  generateMonthlyReport() {
    return `
            <h4>Trend Kehadiran Bulanan</h4>
            <div class="chart-container" style="height: 250px;">
                <canvas id="monthlyDetailChart"></canvas>
            </div>
            <script>
                // Simple chart for demo
                const monthlyCtx = document.getElementById('monthlyDetailChart').getContext('2d');
                new Chart(monthlyCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                        datasets: [{
                            label: 'Kehadiran (%)',
                            data: [85, 78, 92, 88, 76, 90, 82, 79, 88, 91, 85, 87],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            </script>
        `;
  }

  generateInstructorReport() {
    return `
            <h4>Kinerja Instruktur</h4>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Instruktur</th>
                            <th>Jumlah Sesi</th>
                            <th>Rata-rata Kehadiran</th>
                            <th>Kepuasan</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dr. Budi Santoso</td>
                            <td>15</td>
                            <td>92%</td>
                            <td>Sangat Baik</td>
                            <td><span class="badge badge-success">Aktif</span></td>
                        </tr>
                        <tr>
                            <td>Ir. Siti Aisyah</td>
                            <td>12</td>
                            <td>88%</td>
                            <td>Baik</td>
                            <td><span class="badge badge-success">Aktif</span></td>
                        </tr>
                        <tr>
                            <td>Prof. Ahmad Wijaya</td>
                            <td>8</td>
                            <td>85%</td>
                            <td>Baik</td>
                            <td><span class="badge badge-warning">Cuti</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
  }

  closeModal() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none";
    });
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

// Initialize reports
let reports;
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("reportsContent")) {
    reports = new Reports();
  }
});

// Global functions for demo
function showCategoryReport() {
  if (reports) reports.showReportDetail("Laporan per Kategori");
}

function showMonthlyReport() {
  if (reports) reports.showReportDetail("Laporan Bulanan");
}

function showInstructorReport() {
  if (reports) reports.showReportDetail("Laporan Instruktur");
}

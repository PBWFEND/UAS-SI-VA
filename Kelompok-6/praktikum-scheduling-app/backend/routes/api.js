// backend/routes/api.js - VERSI LENGKAP DENGAN SEMUA PERBAIKAN
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { db } = require("../database");

// Middleware untuk cek authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
  next();
};

// ========== HELPER FUNCTIONS ==========
function getDayName(date) {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

function formatTime(startTime, endTime) {
  if (!startTime || !endTime) return "";
  return `${startTime} - ${endTime}`;
}

// ========== AUTHENTICATION ==========
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username dan password diperlukan",
    });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: "Username atau password salah",
      });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.name = user.name;
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  });
});

router.get("/current-user", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.session.userId,
      username: req.session.username,
      name: req.session.name,
      role: req.session.role,
    },
  });
});

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Gagal logout: " + err.message,
      });
    }
    res.json({
      success: true,
      message: "Logout berhasil",
    });
  });
});

// ========== CATEGORIES CRUD ==========
router.get("/categories", requireAuth, (req, res) => {
  db.all("SELECT * FROM praktikum_categories ORDER BY name", (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  });
});

router.get("/categories/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT * FROM praktikum_categories WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: "Kategori tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: row,
      });
    }
  );
});

router.post("/categories", requireAuth, (req, res) => {
  const {
    name,
    description,
    max_participants,
    duration_hours,
    color_code,
    lab_fee,
    equipment,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Nama kategori diperlukan",
    });
  }

  db.get(
    "SELECT id FROM praktikum_categories WHERE name = ?",
    [name],
    (err, existing) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Nama kategori sudah digunakan",
        });
      }

      db.run(
        `INSERT INTO praktikum_categories 
          (name, description, max_participants, duration_hours, color_code, lab_fee, equipment) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || "",
          max_participants || 20,
          duration_hours || 2,
          color_code || "#3b82f6",
          lab_fee || 0,
          equipment || "",
        ],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Gagal menyimpan kategori: " + err.message,
            });
          }

          db.get(
            "SELECT * FROM praktikum_categories WHERE id = ?",
            [this.lastID],
            (err, category) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                  success: false,
                  error: "Database error: " + err.message,
                });
              }

              res.status(201).json({
                success: true,
                message: "Kategori berhasil ditambahkan",
                data: category,
                id: this.lastID,
              });
            }
          );
        }
      );
    }
  );
});

router.put("/categories/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    max_participants,
    duration_hours,
    color_code,
    lab_fee,
    equipment,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Nama kategori diperlukan",
    });
  }

  db.get(
    "SELECT id FROM praktikum_categories WHERE id = ?",
    [id],
    (err, category) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Kategori tidak ditemukan",
        });
      }

      db.get(
        "SELECT id FROM praktikum_categories WHERE name = ? AND id != ?",
        [name, id],
        (err, existing) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Database error: " + err.message,
            });
          }

          if (existing) {
            return res.status(400).json({
              success: false,
              error: "Nama kategori sudah digunakan",
            });
          }

          db.run(
            `UPDATE praktikum_categories SET 
                name = ?, description = ?, max_participants = ?, 
                duration_hours = ?, color_code = ?, lab_fee = ?, equipment = ?, 
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
              name,
              description || "",
              max_participants || 20,
              duration_hours || 2,
              color_code || "#3b82f6",
              lab_fee || 0,
              equipment || "",
              id,
            ],
            function (err) {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                  success: false,
                  error: "Gagal memperbarui kategori: " + err.message,
                });
              }

              db.get(
                "SELECT * FROM praktikum_categories WHERE id = ?",
                [id],
                (err, updatedCategory) => {
                  if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({
                      success: false,
                      error: "Database error: " + err.message,
                    });
                  }

                  res.json({
                    success: true,
                    message: "Kategori berhasil diperbarui",
                    data: updatedCategory,
                    changes: this.changes,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

router.delete("/categories/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id FROM groups WHERE praktikum_id = ? LIMIT 1",
    [id],
    (err, group) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (group) {
        return res.status(400).json({
          success: false,
          error:
            "Tidak dapat menghapus kategori yang sudah digunakan oleh kelompok",
        });
      }

      db.run(
        "DELETE FROM praktikum_categories WHERE id = ?",
        [id],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Gagal menghapus kategori: " + err.message,
            });
          }

          res.json({
            success: true,
            message: "Kategori berhasil dihapus",
            changes: this.changes,
          });
        }
      );
    }
  );
});

// ========== GROUPS CRUD ==========
router.get("/groups", requireAuth, (req, res) => {
  const { praktikum_id, status } = req.query;

  let query = `
        SELECT g.*, pc.name as praktikum_name, pc.color_code
        FROM groups g 
        LEFT JOIN praktikum_categories pc ON g.praktikum_id = pc.id
        WHERE 1=1
    `;

  const params = [];

  if (praktikum_id) {
    query += " AND g.praktikum_id = ?";
    params.push(praktikum_id);
  }

  if (status) {
    query += " AND g.status = ?";
    params.push(status);
  }

  query += " ORDER BY g.group_name";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  });
});

router.get("/groups/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT g.*, pc.name as praktikum_name, pc.color_code
        FROM groups g 
        LEFT JOIN praktikum_categories pc ON g.praktikum_id = pc.id
        WHERE g.id = ?
    `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: "Kelompok tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: row,
    });
  });
});

router.post("/groups", requireAuth, (req, res) => {
  const {
    group_name,
    praktikum_id,
    member_count,
    leader_name,
    leader_nim,
    leader_contact,
    assistant_name,
    assistant_nim,
    assistant_contact,
    email,
    notes,
    status = "active",
  } = req.body;

  if (!group_name || !praktikum_id || !member_count) {
    return res.status(400).json({
      success: false,
      error: "Nama kelompok, kategori, dan jumlah anggota diperlukan",
    });
  }

  db.get(
    "SELECT id FROM groups WHERE group_name = ?",
    [group_name],
    (err, existing) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Nama kelompok sudah digunakan",
        });
      }

      db.run(
        `INSERT INTO groups 
          (group_name, praktikum_id, member_count, leader_name, leader_nim, 
           leader_contact, assistant_name, assistant_nim, assistant_contact, 
           email, notes, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          group_name,
          praktikum_id,
          member_count,
          leader_name || "",
          leader_nim || "",
          leader_contact || "",
          assistant_name || "",
          assistant_nim || "",
          assistant_contact || "",
          email || "",
          notes || "",
          status,
        ],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Gagal menyimpan kelompok: " + err.message,
            });
          }

          db.get(
            `
                SELECT g.*, pc.name as praktikum_name, pc.color_code
                FROM groups g
                LEFT JOIN praktikum_categories pc ON g.praktikum_id = pc.id
                WHERE g.id = ?
            `,
            [this.lastID],
            (err, newGroup) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                  success: false,
                  error: "Database error: " + err.message,
                });
              }

              res.status(201).json({
                success: true,
                message: "Kelompok berhasil ditambahkan",
                data: newGroup,
                id: this.lastID,
              });
            }
          );
        }
      );
    }
  );
});

router.put("/groups/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    group_name,
    praktikum_id,
    member_count,
    leader_name,
    leader_nim,
    leader_contact,
    assistant_name,
    assistant_nim,
    assistant_contact,
    email,
    notes,
    status,
  } = req.body;

  if (!group_name || !praktikum_id || !member_count) {
    return res.status(400).json({
      success: false,
      error: "Nama kelompok, kategori, dan jumlah anggota diperlukan",
    });
  }

  db.get("SELECT id FROM groups WHERE id = ?", [id], (err, group) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!group) {
      return res.status(404).json({
        success: false,
        error: "Kelompok tidak ditemukan",
      });
    }

    db.get(
      "SELECT id FROM groups WHERE group_name = ? AND id != ?",
      [group_name, id],
      (err, existing) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Database error: " + err.message,
          });
        }

        if (existing) {
          return res.status(400).json({
            success: false,
            error: "Nama kelompok sudah digunakan",
          });
        }

        db.run(
          `UPDATE groups SET 
                group_name = ?, praktikum_id = ?, member_count = ?, 
                leader_name = ?, leader_nim = ?, leader_contact = ?,
                assistant_name = ?, assistant_nim = ?, assistant_contact = ?,
                email = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
          [
            group_name,
            praktikum_id,
            member_count,
            leader_name || "",
            leader_nim || "",
            leader_contact || "",
            assistant_name || "",
            assistant_nim || "",
            assistant_contact || "",
            email || "",
            notes || "",
            status || "active",
            id,
          ],
          function (err) {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({
                success: false,
                error: "Gagal memperbarui kelompok: " + err.message,
              });
            }

            db.get(
              `
                  SELECT g.*, pc.name as praktikum_name, pc.color_code
                  FROM groups g
                  LEFT JOIN praktikum_categories pc ON g.praktikum_id = pc.id
                  WHERE g.id = ?
                `,
              [id],
              (err, updatedGroup) => {
                if (err) {
                  console.error("Database error:", err);
                  return res.status(500).json({
                    success: false,
                    error: "Database error: " + err.message,
                  });
                }

                res.json({
                  success: true,
                  message: "Kelompok berhasil diperbarui",
                  data: updatedGroup,
                  changes: this.changes,
                });
              }
            );
          }
        );
      }
    );
  });
});

router.delete("/groups/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id FROM schedules WHERE group_id = ? LIMIT 1",
    [id],
    (err, schedule) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (schedule) {
        return res.status(400).json({
          success: false,
          error: "Tidak dapat menghapus kelompok yang sudah memiliki jadwal",
        });
      }

      db.run("DELETE FROM groups WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Gagal menghapus kelompok: " + err.message,
          });
        }

        res.json({
          success: true,
          message: "Kelompok berhasil dihapus",
          changes: this.changes,
        });
      });
    }
  );
});

// ========== SCHEDULES CRUD ==========
router.get("/schedules", requireAuth, (req, res) => {
  const { date, month, year, praktikum_id, status, group_id } = req.query;

  let query = `
        SELECT s.*, 
               pc.name as praktikum_name, 
               pc.color_code,
               g.group_name, 
               g.member_count,
               g.leader_name,
               g.leader_nim,
               CASE 
                 WHEN a.id IS NOT NULL THEN 'attendance_exists'
                 ELSE 'no_attendance'
               END as attendance_status,
               a.id as attendance_id,
               a.present_count,
               a.absent_count,
               a.late_count
        FROM schedules s
        LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
        LEFT JOIN groups g ON s.group_id = g.id
        LEFT JOIN attendance a ON s.id = a.schedule_id
        WHERE 1=1
    `;

  const params = [];

  if (date) {
    query += " AND s.schedule_date = ?";
    params.push(date);
  }

  if (month && year) {
    query +=
      " AND strftime('%m', s.schedule_date) = ? AND strftime('%Y', s.schedule_date) = ?";
    params.push(month.padStart(2, "0"), year);
  }

  if (praktikum_id) {
    query += " AND s.praktikum_id = ?";
    params.push(praktikum_id);
  }

  if (status) {
    query += " AND s.status = ?";
    params.push(status);
  }

  if (group_id) {
    query += " AND s.group_id = ?";
    params.push(group_id);
  }

  query += " ORDER BY s.schedule_date, s.start_time";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    // Format data dengan attendance rate
    const formattedRows = rows.map((row) => {
      let data = {
        ...row,
        formatted_date: formatDate(row.schedule_date),
        formatted_time: formatTime(row.start_time, row.end_time),
      };

      // Jika ada attendance, hitung rate
      if (row.attendance_status === "attendance_exists") {
        const total =
          (row.present_count || 0) +
          (row.absent_count || 0) +
          (row.late_count || 0);
        const attendanceRate =
          total > 0 ? Math.round((row.present_count / total) * 100) : 0;

        data.attendance_data = {
          attendance_id: row.attendance_id,
          present_count: row.present_count,
          absent_count: row.absent_count,
          late_count: row.late_count,
          total_count: total,
          attendance_rate: attendanceRate,
          attendance_quality:
            attendanceRate >= 80
              ? "Good"
              : attendanceRate >= 60
              ? "Fair"
              : "Poor",
        };
      }

      return data;
    });

    res.json({
      success: true,
      data: formattedRows,
      count: rows.length,
    });
  });
});

// Endpoint khusus untuk mendapatkan jadwal yang belum ada attendance
router.get("/schedules/without-attendance", requireAuth, (req, res) => {
  const { date, praktikum_id, group_id } = req.query;

  let query = `
        SELECT 
            s.*,
            pc.name as praktikum_name,
            pc.color_code,
            g.group_name,
            g.member_count,
            g.leader_name,
            g.leader_nim
        FROM schedules s
        LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
        LEFT JOIN groups g ON s.group_id = g.id
        WHERE s.id NOT IN (SELECT schedule_id FROM attendance WHERE schedule_id IS NOT NULL)
          AND s.status IN ('scheduled', 'completed')
    `;

  const params = [];

  if (date) {
    query += " AND s.schedule_date = ?";
    params.push(date);
  }

  if (praktikum_id) {
    query += " AND s.praktikum_id = ?";
    params.push(praktikum_id);
  }

  if (group_id) {
    query += " AND s.group_id = ?";
    params.push(group_id);
  }

  query += " ORDER BY s.schedule_date DESC, s.start_time";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      message:
        rows.length === 0
          ? "Semua jadwal sudah memiliki data kehadiran"
          : "Ditemukan jadwal tanpa data kehadiran",
    });
  });
});

router.get("/schedules/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT s.*, 
               pc.name as praktikum_name, 
               pc.color_code,
               g.group_name, 
               g.member_count,
               g.leader_name,
               g.leader_nim,
               g.leader_contact,
               a.id as attendance_id,
               a.present_count,
               a.absent_count,
               a.late_count,
               a.notes as attendance_notes,
               a.attendance_date,
               a.submitted_by,
               a.submitted_at
        FROM schedules s
        LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
        LEFT JOIN groups g ON s.group_id = g.id
        LEFT JOIN attendance a ON s.id = a.schedule_id
        WHERE s.id = ?
    `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: "Jadwal tidak ditemukan",
      });
    }

    // Format data dengan attendance jika ada
    let formattedData = {
      ...row,
      formatted_date: formatDate(row.schedule_date),
      formatted_time: formatTime(row.start_time, row.end_time),
    };

    if (row.attendance_id) {
      const total =
        (row.present_count || 0) +
        (row.absent_count || 0) +
        (row.late_count || 0);
      const attendanceRate =
        total > 0 ? Math.round((row.present_count / total) * 100) : 0;

      formattedData.attendance_data = {
        attendance_id: row.attendance_id,
        present_count: row.present_count,
        absent_count: row.absent_count,
        late_count: row.late_count,
        total_count: total,
        attendance_rate: attendanceRate,
        attendance_quality:
          attendanceRate >= 80
            ? "Good"
            : attendanceRate >= 60
            ? "Fair"
            : "Poor",
        attendance_notes: row.attendance_notes,
        attendance_date: row.attendance_date,
        submitted_by: row.submitted_by,
        submitted_at: row.submitted_at,
      };
    }

    res.json({
      success: true,
      data: formattedData,
      has_attendance: !!row.attendance_id,
    });
  });
});

router.post("/schedules", requireAuth, (req, res) => {
  const {
    praktikum_id,
    group_id,
    schedule_date,
    day,
    start_time,
    end_time,
    room,
    instructor,
    assistant,
    notes,
    status,
  } = req.body;

  if (
    !praktikum_id ||
    !group_id ||
    !schedule_date ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({
      success: false,
      error:
        "Data jadwal tidak lengkap. Harap isi kategori, kelompok, tanggal, waktu mulai, dan waktu selesai.",
    });
  }

  const scheduleDay = day || getDayName(new Date(schedule_date));

  db.run(
    `INSERT INTO schedules (
            praktikum_id, group_id, schedule_date, day, 
            start_time, end_time, room, instructor, assistant, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      praktikum_id,
      group_id,
      schedule_date,
      scheduleDay,
      start_time,
      end_time,
      room || "Lab",
      instructor || "",
      assistant || "",
      notes || "",
      status || "scheduled",
    ],
    function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Gagal menyimpan jadwal: " + err.message,
        });
      }

      db.get(
        `
                SELECT s.*, 
                       pc.name as praktikum_name, 
                       pc.color_code,
                       g.group_name
                FROM schedules s
                LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
                LEFT JOIN groups g ON s.group_id = g.id
                WHERE s.id = ?
            `,
        [this.lastID],
        (err, newSchedule) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Database error: " + err.message,
            });
          }

          res.status(201).json({
            success: true,
            message: "Jadwal berhasil ditambahkan",
            data: newSchedule,
            id: this.lastID,
          });
        }
      );
    }
  );
});

router.put("/schedules/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    praktikum_id,
    group_id,
    schedule_date,
    day,
    start_time,
    end_time,
    room,
    instructor,
    assistant,
    notes,
    status,
  } = req.body;

  db.get("SELECT id FROM schedules WHERE id = ?", [id], (err, schedule) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: "Jadwal tidak ditemukan",
      });
    }

    const scheduleDay = day || getDayName(new Date(schedule_date));

    db.run(
      `UPDATE schedules SET 
                praktikum_id = ?, group_id = ?, schedule_date = ?, day = ?,
                start_time = ?, end_time = ?, room = ?, instructor = ?, 
                assistant = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      [
        praktikum_id,
        group_id,
        schedule_date,
        scheduleDay,
        start_time,
        end_time,
        room || "Lab",
        instructor || "",
        assistant || "",
        notes || "",
        status || "scheduled",
        id,
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Gagal memperbarui jadwal: " + err.message,
          });
        }

        db.get(
          `
              SELECT s.*, 
                     pc.name as praktikum_name, 
                     pc.color_code,
                     g.group_name
              FROM schedules s
              LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
              LEFT JOIN groups g ON s.group_id = g.id
              WHERE s.id = ?
            `,
          [id],
          (err, updatedSchedule) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({
                success: false,
                error: "Database error: " + err.message,
              });
            }

            res.json({
              success: true,
              message: "Jadwal berhasil diperbarui",
              data: updatedSchedule,
              changes: this.changes,
            });
          }
        );
      }
    );
  });
});

router.delete("/schedules/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id FROM attendance WHERE schedule_id = ? LIMIT 1",
    [id],
    (err, attendance) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (attendance) {
        return res.status(400).json({
          success: false,
          error:
            "Tidak dapat menghapus jadwal yang sudah memiliki data kehadiran",
        });
      }

      db.run("DELETE FROM schedules WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Gagal menghapus jadwal: " + err.message,
          });
        }
        res.json({
          success: true,
          message: "Jadwal berhasil dihapus",
          changes: this.changes,
        });
      });
    }
  );
});

// ========== ATTENDANCE CRUD ==========
router.get("/attendance", requireAuth, (req, res) => {
  const {
    schedule_id,
    date,
    month,
    year,
    group_id,
    praktikum_id,
    page = 1,
    limit = 50,
  } = req.query;

  let query = `
        SELECT 
            a.*,
            s.schedule_date,
            s.start_time,
            s.end_time,
            s.room,
            s.instructor,
            s.assistant,
            s.day,
            pc.name as praktikum_name,
            pc.color_code,
            g.group_name,
            g.leader_name,
            g.leader_nim,
            g.member_count,
            u.name as submitted_by_name
        FROM attendance a
        LEFT JOIN schedules s ON a.schedule_id = s.id
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        LEFT JOIN groups g ON a.group_id = g.id
        LEFT JOIN users u ON a.submitted_by = u.username
        WHERE 1=1
    `;

  let countQuery = `
        SELECT COUNT(*) as total
        FROM attendance a
        WHERE 1=1
    `;

  const params = [];
  const countParams = [];

  if (schedule_id) {
    query += " AND a.schedule_id = ?";
    countQuery += " AND a.schedule_id = ?";
    params.push(schedule_id);
    countParams.push(schedule_id);
  }

  if (date) {
    query += " AND DATE(a.attendance_date) = ?";
    countQuery += " AND DATE(a.attendance_date) = ?";
    params.push(date);
    countParams.push(date);
  }

  if (month && year) {
    query +=
      " AND strftime('%m', a.attendance_date) = ? AND strftime('%Y', a.attendance_date) = ?";
    countQuery +=
      " AND strftime('%m', a.attendance_date) = ? AND strftime('%Y', a.attendance_date) = ?";
    params.push(month.padStart(2, "0"), year);
    countParams.push(month.padStart(2, "0"), year);
  }

  if (group_id) {
    query += " AND a.group_id = ?";
    countQuery += " AND a.group_id = ?";
    params.push(group_id);
    countParams.push(group_id);
  }

  if (praktikum_id) {
    query += " AND a.praktikum_id = ?";
    countQuery += " AND a.praktikum_id = ?";
    params.push(praktikum_id);
    countParams.push(praktikum_id);
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += " ORDER BY a.attendance_date DESC, a.submitted_at DESC";
  query += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  Promise.all([
    new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total : 0);
      });
    }),
  ])
    .then(([rows, total]) => {
      const rowsWithPercentage = rows.map((row) => {
        const totalCount =
          (row.present_count || 0) +
          (row.absent_count || 0) +
          (row.late_count || 0);
        const attendanceRate =
          totalCount > 0
            ? Math.round((row.present_count / totalCount) * 100)
            : 0;

        let attendance_status = "Unknown";
        if (attendanceRate >= 80) attendance_status = "Good";
        else if (attendanceRate >= 60) attendance_status = "Fair";
        else if (totalCount > 0) attendance_status = "Poor";

        return {
          ...row,
          total_count: totalCount,
          attendance_rate: attendanceRate,
          attendance_status: attendance_status,
          formatted_date: formatDate(row.attendance_date),
          formatted_time: formatTime(row.start_time, row.end_time),
        };
      });

      res.json({
        success: true,
        data: rowsWithPercentage,
        pagination: {
          total: total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / parseInt(limit)),
        },
      });
    })
    .catch((err) => {
      console.error("Database error:", err);
      res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    });
});

// Endpoint untuk melihat semua data attendance dengan status
router.get("/attendance/with-status", requireAuth, (req, res) => {
  const { date, month, year, praktikum_id } = req.query;

  let query = `
        SELECT 
            s.id as schedule_id,
            s.schedule_date,
            s.start_time,
            s.end_time,
            s.room,
            s.instructor,
            s.status as schedule_status,
            pc.name as praktikum_name,
            g.group_name,
            g.leader_name,
            a.id as attendance_id,
            a.present_count,
            a.absent_count,
            a.late_count,
            a.attendance_date,
            a.submitted_by,
            CASE 
                WHEN a.id IS NOT NULL THEN 'HAS_ATTENDANCE'
                ELSE 'NO_ATTENDANCE'
            END as attendance_status
        FROM schedules s
        LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
        LEFT JOIN groups g ON s.group_id = g.id
        LEFT JOIN attendance a ON s.id = a.schedule_id
        WHERE s.status IN ('scheduled', 'completed')
    `;

  const params = [];

  if (date) {
    query += " AND s.schedule_date = ?";
    params.push(date);
  }

  if (month && year) {
    query +=
      " AND strftime('%m', s.schedule_date) = ? AND strftime('%Y', s.schedule_date) = ?";
    params.push(month.padStart(2, "0"), year);
  }

  if (praktikum_id) {
    query += " AND s.praktikum_id = ?";
    params.push(praktikum_id);
  }

  query += " ORDER BY s.schedule_date DESC, s.start_time";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    // Format data
    const formattedData = rows.map((row) => {
      let data = {
        schedule_id: row.schedule_id,
        schedule_date: row.schedule_date,
        time: formatTime(row.start_time, row.end_time),
        room: row.room,
        praktikum_name: row.praktikum_name,
        group_name: row.group_name,
        leader_name: row.leader_name,
        attendance_status: row.attendance_status,
      };

      // Jika ada attendance, tambahkan detail
      if (row.attendance_status === "HAS_ATTENDANCE") {
        const total =
          (row.present_count || 0) +
          (row.absent_count || 0) +
          (row.late_count || 0);
        const attendanceRate =
          total > 0 ? Math.round((row.present_count / total) * 100) : 0;

        data.attendance_details = {
          attendance_id: row.attendance_id,
          attendance_date: row.attendance_date,
          present_count: row.present_count,
          absent_count: row.absent_count,
          late_count: row.late_count,
          total_count: total,
          attendance_rate: attendanceRate,
          submitted_by: row.submitted_by,
        };
      }

      return data;
    });

    // Hitung statistik
    const withAttendance = rows.filter(
      (r) => r.attendance_status === "HAS_ATTENDANCE"
    ).length;
    const withoutAttendance = rows.filter(
      (r) => r.attendance_status === "NO_ATTENDANCE"
    ).length;

    res.json({
      success: true,
      data: formattedData,
      statistics: {
        total: rows.length,
        with_attendance: withAttendance,
        without_attendance: withoutAttendance,
        attendance_percentage:
          rows.length > 0
            ? Math.round((withAttendance / rows.length) * 100)
            : 0,
      },
    });
  });
});

router.get("/attendance/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT 
            a.*,
            s.schedule_date,
            s.start_time,
            s.end_time,
            s.room,
            s.instructor,
            s.assistant,
            s.day,
            pc.name as praktikum_name,
            pc.max_participants,
            pc.color_code,
            g.group_name,
            g.leader_name,
            g.leader_nim,
            g.leader_contact,
            g.member_count,
            u.name as submitted_by_name
        FROM attendance a
        LEFT JOIN schedules s ON a.schedule_id = s.id
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        LEFT JOIN groups g ON a.group_id = g.id
        LEFT JOIN users u ON a.submitted_by = u.username
        WHERE a.id = ?
    `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        error: "Data kehadiran tidak ditemukan",
      });
    }

    const total =
      (row.present_count || 0) +
      (row.absent_count || 0) +
      (row.late_count || 0);
    const attendanceRate =
      total > 0 ? Math.round((row.present_count / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...row,
        total_count: total,
        attendance_rate: attendanceRate,
        attendance_status:
          attendanceRate >= 80
            ? "Good"
            : attendanceRate >= 60
            ? "Fair"
            : "Poor",
        formatted_date: formatDate(row.attendance_date),
        formatted_time: formatTime(row.start_time, row.end_time),
      },
    });
  });
});

// Endpoint untuk mendapatkan attendance berdasarkan schedule_id
router.get("/attendance/by-schedule/:schedule_id", requireAuth, (req, res) => {
  const { schedule_id } = req.params;

  const query = `
        SELECT 
            a.*,
            s.schedule_date,
            s.start_time,
            s.end_time,
            s.room,
            s.instructor,
            s.assistant,
            s.day,
            pc.name as praktikum_name,
            pc.max_participants,
            pc.color_code,
            g.group_name,
            g.leader_name,
            g.leader_nim,
            g.member_count,
            u.name as submitted_by_name
        FROM attendance a
        LEFT JOIN schedules s ON a.schedule_id = s.id
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        LEFT JOIN groups g ON a.group_id = g.id
        LEFT JOIN users u ON a.submitted_by = u.username
        WHERE a.schedule_id = ?
    `;

  db.get(query, [schedule_id], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!row) {
      return res.status(200).json({
        success: true,
        data: null,
        has_attendance: false,
        message: "Belum ada data kehadiran untuk jadwal ini",
      });
    }

    const total =
      (row.present_count || 0) +
      (row.absent_count || 0) +
      (row.late_count || 0);
    const attendanceRate =
      total > 0 ? Math.round((row.present_count / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...row,
        total_count: total,
        attendance_rate: attendanceRate,
        attendance_status:
          attendanceRate >= 80
            ? "Good"
            : attendanceRate >= 60
            ? "Fair"
            : "Poor",
        formatted_date: formatDate(row.attendance_date),
        formatted_time: formatTime(row.start_time, row.end_time),
      },
      has_attendance: true,
      message: "Data kehadiran ditemukan",
    });
  });
});

// Endpoint untuk melihat attendance berdasarkan tanggal
router.get("/attendance/date/:date", requireAuth, (req, res) => {
  const { date } = req.params;

  const query = `
        SELECT 
            a.*,
            s.schedule_date,
            s.start_time,
            s.end_time,
            s.room,
            s.instructor,
            s.assistant,
            s.day,
            pc.name as praktikum_name,
            pc.color_code,
            g.group_name,
            g.leader_name,
            g.leader_nim,
            g.member_count,
            u.name as submitted_by_name
        FROM attendance a
        LEFT JOIN schedules s ON a.schedule_id = s.id
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        LEFT JOIN groups g ON a.group_id = g.id
        LEFT JOIN users u ON a.submitted_by = u.username
        WHERE DATE(a.attendance_date) = ?
        ORDER BY s.start_time
    `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    const formattedRows = rows.map((row) => {
      const total =
        (row.present_count || 0) +
        (row.absent_count || 0) +
        (row.late_count || 0);
      const attendanceRate =
        total > 0 ? Math.round((row.present_count / total) * 100) : 0;

      return {
        ...row,
        total_count: total,
        attendance_rate: attendanceRate,
        attendance_status:
          attendanceRate >= 80
            ? "Good"
            : attendanceRate >= 60
            ? "Fair"
            : "Poor",
        formatted_date: formatDate(row.attendance_date),
        formatted_time: formatTime(row.start_time, row.end_time),
      };
    });

    res.json({
      success: true,
      data: formattedRows,
      count: rows.length,
      date: date,
    });
  });
});

// POST attendance - CREATE atau UPDATE
router.post("/attendance", requireAuth, (req, res) => {
  const {
    schedule_id,
    group_id,
    praktikum_id,
    attendance_date,
    present_count,
    absent_count,
    late_count,
    notes,
  } = req.body;

  if (!schedule_id || !group_id || !praktikum_id || !attendance_date) {
    return res.status(400).json({
      success: false,
      error:
        "Data kehadiran tidak lengkap. Pastikan jadwal, kelompok, praktikum, dan tanggal diisi.",
    });
  }

  const present = parseInt(present_count) || 0;
  const absent = parseInt(absent_count) || 0;
  const late = parseInt(late_count) || 0;

  if (present < 0 || absent < 0 || late < 0) {
    return res.status(400).json({
      success: false,
      error: "Jumlah kehadiran tidak boleh negatif",
    });
  }

  // Cek apakah schedule ada
  db.get(
    `SELECT s.*, g.group_name, pc.name as praktikum_name 
     FROM schedules s
     LEFT JOIN groups g ON s.group_id = g.id
     LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
     WHERE s.id = ?`,
    [schedule_id],
    (err, schedule) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database error: " + err.message,
        });
      }

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: "Jadwal tidak ditemukan",
        });
      }

      // Cek apakah sudah ada attendance
      db.get(
        "SELECT id FROM attendance WHERE schedule_id = ?",
        [schedule_id],
        (err, existing) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              success: false,
              error: "Database error: " + err.message,
            });
          }

          if (existing) {
            // UPDATE existing attendance
            db.run(
              `UPDATE attendance SET 
                group_id = ?,
                praktikum_id = ?,
                attendance_date = ?,
                present_count = ?, 
                absent_count = ?, 
                late_count = ?, 
                notes = ?, 
                submitted_by = ?,
                submitted_at = CURRENT_TIMESTAMP
              WHERE schedule_id = ?`,
              [
                group_id,
                praktikum_id,
                attendance_date,
                present,
                absent,
                late,
                notes || "",
                req.session.username || "System",
                schedule_id,
              ],
              function (updateErr) {
                if (updateErr) {
                  console.error("Database error:", updateErr);
                  return res.status(500).json({
                    success: false,
                    error: "Gagal memperbarui kehadiran: " + updateErr.message,
                  });
                }

                // Update schedule status to completed
                db.run(
                  `UPDATE schedules SET status = 'completed' WHERE id = ?`,
                  [schedule_id]
                );

                // Get updated record
                db.get(
                  `
                  SELECT 
                    a.*,
                    s.schedule_date,
                    s.start_time,
                    s.end_time,
                    s.room,
                    pc.name as praktikum_name,
                    g.group_name,
                    g.leader_name,
                    g.member_count
                  FROM attendance a
                  LEFT JOIN schedules s ON a.schedule_id = s.id
                  LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
                  LEFT JOIN groups g ON a.group_id = g.id
                  WHERE a.schedule_id = ?
                `,
                  [schedule_id],
                  (err, updatedRecord) => {
                    if (err) {
                      console.error("Database error:", err);
                      return res.status(500).json({
                        success: false,
                        error:
                          "Berhasil memperbarui, tetapi gagal mengambil data: " +
                          err.message,
                      });
                    }

                    const total =
                      (updatedRecord.present_count || 0) +
                      (updatedRecord.absent_count || 0) +
                      (updatedRecord.late_count || 0);
                    const attendanceRate =
                      total > 0
                        ? Math.round(
                            (updatedRecord.present_count / total) * 100
                          )
                        : 0;

                    res.json({
                      success: true,
                      message: "Kehadiran berhasil diperbarui",
                      data: {
                        ...updatedRecord,
                        total_count: total,
                        attendance_rate: attendanceRate,
                        attendance_status:
                          attendanceRate >= 80
                            ? "Good"
                            : attendanceRate >= 60
                            ? "Fair"
                            : "Poor",
                      },
                      updated: true,
                    });
                  }
                );
              }
            );
          } else {
            // INSERT new attendance
            db.run(
              `INSERT INTO attendance (
                schedule_id, 
                group_id, 
                praktikum_id, 
                attendance_date, 
                present_count, 
                absent_count, 
                late_count, 
                notes, 
                submitted_by
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                schedule_id,
                group_id,
                praktikum_id,
                attendance_date,
                present,
                absent,
                late,
                notes || "",
                req.session.username || "System",
              ],
              function (insertErr) {
                if (insertErr) {
                  console.error("Database error:", insertErr);
                  return res.status(500).json({
                    success: false,
                    error: "Gagal menyimpan kehadiran: " + insertErr.message,
                  });
                }

                // Update schedule status to completed
                db.run(
                  `UPDATE schedules SET status = 'completed' WHERE id = ?`,
                  [schedule_id]
                );

                // Get new record
                db.get(
                  `
                  SELECT 
                    a.*,
                    s.schedule_date,
                    s.start_time,
                    s.end_time,
                    s.room,
                    pc.name as praktikum_name,
                    g.group_name,
                    g.leader_name,
                    g.member_count
                  FROM attendance a
                  LEFT JOIN schedules s ON a.schedule_id = s.id
                  LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
                  LEFT JOIN groups g ON a.group_id = g.id
                  WHERE a.id = ?
                `,
                  [this.lastID],
                  (err, newRecord) => {
                    if (err) {
                      console.error("Database error:", err);
                      return res.status(500).json({
                        success: false,
                        error:
                          "Berhasil menyimpan, tetapi gagal mengambil data: " +
                          err.message,
                      });
                    }

                    const total =
                      (newRecord.present_count || 0) +
                      (newRecord.absent_count || 0) +
                      (newRecord.late_count || 0);
                    const attendanceRate =
                      total > 0
                        ? Math.round((newRecord.present_count / total) * 100)
                        : 0;

                    res.status(201).json({
                      success: true,
                      message: "Kehadiran berhasil disimpan",
                      data: {
                        ...newRecord,
                        total_count: total,
                        attendance_rate: attendanceRate,
                        attendance_status:
                          attendanceRate >= 80
                            ? "Good"
                            : attendanceRate >= 60
                            ? "Fair"
                            : "Poor",
                      },
                      id: this.lastID,
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  );
});

router.put("/attendance/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { present_count, absent_count, late_count, notes } = req.body;

  const present = parseInt(present_count) || 0;
  const absent = parseInt(absent_count) || 0;
  const late = parseInt(late_count) || 0;

  if (present < 0 || absent < 0 || late < 0) {
    return res.status(400).json({
      success: false,
      error: "Jumlah kehadiran tidak boleh negatif",
    });
  }

  db.get("SELECT id FROM attendance WHERE id = ?", [id], (err, attendance) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: "Data kehadiran tidak ditemukan",
      });
    }

    db.run(
      `UPDATE attendance SET 
        present_count = ?, 
        absent_count = ?, 
        late_count = ?, 
        notes = ?, 
        submitted_by = ?,
        submitted_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        present,
        absent,
        late,
        notes || "",
        req.session.username || "System",
        id,
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            success: false,
            error: "Gagal memperbarui kehadiran: " + err.message,
          });
        }

        db.get(
          `
            SELECT 
              a.*,
              s.schedule_date,
              s.start_time,
              s.end_time,
              pc.name as praktikum_name,
              g.group_name
            FROM attendance a
            LEFT JOIN schedules s ON a.schedule_id = s.id
            LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
            LEFT JOIN groups g ON a.group_id = g.id
            WHERE a.id = ?
          `,
          [id],
          (err, updatedAttendance) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({
                success: false,
                error: "Database error: " + err.message,
              });
            }

            const total =
              (updatedAttendance.present_count || 0) +
              (updatedAttendance.absent_count || 0) +
              (updatedAttendance.late_count || 0);
            const attendanceRate =
              total > 0
                ? Math.round((updatedAttendance.present_count / total) * 100)
                : 0;

            res.json({
              success: true,
              message: "Kehadiran berhasil diperbarui",
              data: {
                ...updatedAttendance,
                total_count: total,
                attendance_rate: attendanceRate,
                attendance_status:
                  attendanceRate >= 80
                    ? "Good"
                    : attendanceRate >= 60
                    ? "Fair"
                    : "Poor",
              },
              changes: this.changes,
            });
          }
        );
      }
    );
  });
});

router.delete("/attendance/:id", requireAuth, (req, res) => {
  const { id } = req.params;

  db.get("SELECT id FROM attendance WHERE id = ?", [id], (err, attendance) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: "Data kehadiran tidak ditemukan",
      });
    }

    db.run("DELETE FROM attendance WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Gagal menghapus kehadiran: " + err.message,
        });
      }

      // Update schedule status back to scheduled
      db.get(
        "SELECT schedule_id FROM attendance WHERE id = ?",
        [id],
        (err, result) => {
          if (!err && result) {
            db.run("UPDATE schedules SET status = 'scheduled' WHERE id = ?", [
              result.schedule_id,
            ]);
          }
        }
      );

      res.json({
        success: true,
        message: "Data kehadiran berhasil dihapus",
        changes: this.changes,
      });
    });
  });
});

// ========== STATISTICS ==========
router.get("/stats/dashboard", requireAuth, (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  Promise.all([
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM schedules", (err, row) => {
        if (err) reject(err);
        else resolve({ totalSchedules: row.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM groups", (err, row) => {
        if (err) reject(err);
        else resolve({ totalGroups: row.count });
      });
    }),
    new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) as count FROM schedules WHERE schedule_date = ?",
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve({ todaySchedules: row.count });
        }
      );
    }),
    new Promise((resolve, reject) => {
      db.get(
        `
          SELECT 
            COALESCE(SUM(present_count), 0) as total_present,
            COALESCE(SUM(present_count + absent_count + late_count), 1) as total_expected
          FROM attendance
          WHERE attendance_date >= date('now', '-30 days')
        `,
        (err, row) => {
          if (err) reject(err);
          else {
            const attendanceRate =
              row.total_expected > 0
                ? Math.round((row.total_present / row.total_expected) * 100)
                : 0;
            resolve({ attendanceRate });
          }
        }
      );
    }),
    new Promise((resolve, reject) => {
      db.get(
        `
          SELECT COUNT(*) as count 
          FROM attendance 
          WHERE attendance_date = ?
        `,
        [today],
        (err, row) => {
          if (err) reject(err);
          else resolve({ todayAttendance: row.count });
        }
      );
    }),
  ])
    .then((results) => {
      const stats = Object.assign({}, ...results);
      res.json({
        success: true,
        data: stats,
      });
    })
    .catch((err) => {
      console.error("Stats error:", err);
      res.status(500).json({
        success: false,
        error: "Gagal mengambil statistik: " + err.message,
      });
    });
});

// ========== REPORTS ==========
router.get("/reports/attendance-summary", requireAuth, (req, res) => {
  const { start_date, end_date, praktikum_id, group_id } = req.query;

  let query = `
        SELECT 
            DATE(a.attendance_date) as date,
            pc.name as praktikum_name,
            g.group_name,
            COUNT(DISTINCT a.id) as total_sessions,
            SUM(a.present_count) as total_present,
            SUM(a.absent_count) as total_absent,
            SUM(a.late_count) as total_late,
            AVG(
                CASE 
                    WHEN (a.present_count + a.absent_count + a.late_count) > 0 
                    THEN (a.present_count * 100.0) / (a.present_count + a.absent_count + a.late_count)
                    ELSE 0 
                END
            ) as avg_attendance_rate
        FROM attendance a
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        LEFT JOIN groups g ON a.group_id = g.id
        WHERE 1=1
    `;

  const params = [];

  if (start_date) {
    query += " AND a.attendance_date >= ?";
    params.push(start_date);
  }

  if (end_date) {
    query += " AND a.attendance_date <= ?";
    params.push(end_date);
  }

  if (praktikum_id) {
    query += " AND a.praktikum_id = ?";
    params.push(praktikum_id);
  }

  if (group_id) {
    query += " AND a.group_id = ?";
    params.push(group_id);
  }

  query += `
        GROUP BY DATE(a.attendance_date), a.praktikum_id, a.group_id
        ORDER BY a.attendance_date DESC
    `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  });
});

router.get("/reports/praktikum-stats", requireAuth, (req, res) => {
  const { start_date, end_date } = req.query;

  let query = `
        SELECT 
            pc.id,
            pc.name as praktikum_name,
            pc.color_code,
            COUNT(DISTINCT a.id) as total_sessions,
            COUNT(DISTINCT a.group_id) as total_groups,
            SUM(a.present_count) as total_present,
            SUM(a.absent_count) as total_absent,
            SUM(a.late_count) as total_late,
            ROUND(AVG(
                CASE 
                    WHEN (a.present_count + a.absent_count + a.late_count) > 0 
                    THEN (a.present_count * 100.0) / (a.present_count + a.absent_count + a.late_count)
                    ELSE 0 
                END
            ), 1) as avg_attendance_rate
        FROM attendance a
        LEFT JOIN praktikum_categories pc ON a.praktikum_id = pc.id
        WHERE 1=1
    `;

  const params = [];

  if (start_date) {
    query += " AND a.attendance_date >= ?";
    params.push(start_date);
  }

  if (end_date) {
    query += " AND a.attendance_date <= ?";
    params.push(end_date);
  }

  query += `
        GROUP BY a.praktikum_id
        ORDER BY avg_attendance_rate DESC
    `;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }

    const totals = rows.reduce(
      (acc, row) => {
        acc.total_sessions += row.total_sessions;
        acc.total_present += row.total_present;
        acc.total_absent += row.total_absent;
        acc.total_late += row.total_late;
        return acc;
      },
      {
        total_sessions: 0,
        total_present: 0,
        total_absent: 0,
        total_late: 0,
      }
    );

    const overallTotal =
      totals.total_present + totals.total_absent + totals.total_late;
    const overallAvg =
      overallTotal > 0
        ? Math.round((totals.total_present / overallTotal) * 100)
        : 0;

    res.json({
      success: true,
      data: rows,
      totals: {
        ...totals,
        overall_attendance_rate: overallAvg,
      },
      count: rows.length,
    });
  });
});

// ========== ADDITIONAL ENDPOINTS ==========
router.get("/schedules/range", requireAuth, (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({
      success: false,
      error: "Tanggal awal dan akhir diperlukan",
    });
  }

  const query = `
        SELECT s.*, 
               pc.name as praktikum_name, 
               pc.color_code,
               g.group_name, 
               g.member_count,
               g.leader_name,
               CASE 
                 WHEN a.id IS NOT NULL THEN 'attendance_exists'
                 ELSE 'no_attendance'
               END as attendance_status
        FROM schedules s
        LEFT JOIN praktikum_categories pc ON s.praktikum_id = pc.id
        LEFT JOIN groups g ON s.group_id = g.id
        LEFT JOIN attendance a ON s.id = a.schedule_id
        WHERE s.schedule_date BETWEEN ? AND ?
        ORDER BY s.schedule_date, s.start_time
    `;

  db.all(query, [start_date, end_date], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  });
});

router.get("/stats/praktikum", requireAuth, (req, res) => {
  const query = `
        SELECT 
            pc.id,
            pc.name,
            pc.color_code,
            COUNT(DISTINCT g.id) as total_groups,
            COUNT(DISTINCT s.id) as total_schedules,
            COALESCE(SUM(a.present_count), 0) as total_present,
            COALESCE(SUM(a.present_count + a.absent_count), 0) as total_attendance
        FROM praktikum_categories pc
        LEFT JOIN groups g ON pc.id = g.praktikum_id
        LEFT JOIN schedules s ON pc.id = s.praktikum_id
        LEFT JOIN attendance a ON s.id = a.schedule_id
        GROUP BY pc.id
        ORDER BY pc.name
    `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Database error: " + err.message,
      });
    }
    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  });
});

// ========== TEST ENDPOINT ==========
router.get("/test-attendance", requireAuth, (req, res) => {
  const testQuery = `
        SELECT 
            'Total Schedules' as type, COUNT(*) as count FROM schedules
        UNION ALL
        SELECT 
            'Total Attendance Records' as type, COUNT(*) as count FROM attendance
        UNION ALL
        SELECT 
            'Schedules with Attendance' as type, COUNT(DISTINCT schedule_id) as count FROM attendance
        UNION ALL
        SELECT 
            'Schedules without Attendance' as type, 
            (SELECT COUNT(*) FROM schedules) - (SELECT COUNT(DISTINCT schedule_id) FROM attendance) as count
  `;

  db.all(testQuery, (err, rows) => {
    if (err) {
      console.error("Test error:", err);
      return res.status(500).json({
        success: false,
        error: "Test error: " + err.message,
      });
    }

    const summary = {};
    rows.forEach((row) => {
      summary[row.type] = row.count;
    });

    res.json({
      success: true,
      summary: summary,
      message: "Test endpoint berhasil",
      timestamp: new Date().toISOString(),
    });
  });
});

module.exports = router;

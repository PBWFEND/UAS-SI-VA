// backend/database.js - PERBAIKAN LENGKAP DENGAN FIX ERROR
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  console.log("🔄 Initializing database...");

  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON");

  // 1. USERS TABLE
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        email TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("❌ Users table error:", err.message);
      else console.log("✅ Users table ready");

      // 2. PRAKTIKUM CATEGORIES
      db.run(
        `CREATE TABLE IF NOT EXISTS praktikum_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            max_participants INTEGER DEFAULT 20,
            duration_hours REAL DEFAULT 2.0,
            color_code TEXT DEFAULT '#3b82f6',
            lab_fee REAL DEFAULT 0,
            equipment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) console.error("❌ Categories table error:", err.message);
          else console.log("✅ Categories table ready");

          // 3. GROUPS TABLE - DIPERBAIKI DENGAN KOLOM YANG LENGKAP
          db.run(
            `CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_name TEXT NOT NULL,
                praktikum_id INTEGER,
                member_count INTEGER DEFAULT 5,
                leader_name TEXT,
                leader_nim TEXT,
                leader_contact TEXT,
                assistant_name TEXT,
                assistant_nim TEXT,
                assistant_contact TEXT,
                email TEXT,
                notes TEXT,
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (praktikum_id) REFERENCES praktikum_categories(id)
            )`,
            (err) => {
              if (err) console.error("❌ Groups table error:", err.message);
              else console.log("✅ Groups table ready");

              // 4. SCHEDULES TABLE
              db.run(
                `CREATE TABLE IF NOT EXISTS schedules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    praktikum_id INTEGER NOT NULL,
                    group_id INTEGER NOT NULL,
                    schedule_date DATE NOT NULL,
                    day TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    room TEXT,
                    instructor TEXT,
                    assistant TEXT,
                    status TEXT DEFAULT 'scheduled',
                    notes TEXT,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (praktikum_id) REFERENCES praktikum_categories(id),
                    FOREIGN KEY (group_id) REFERENCES groups(id)
                )`,
                (err) => {
                  if (err)
                    console.error("❌ Schedules table error:", err.message);
                  else console.log("✅ Schedules table ready");

                  // 5. ATTENDANCE TABLE
                  db.run(
                    `CREATE TABLE IF NOT EXISTS attendance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        schedule_id INTEGER NOT NULL,
                        group_id INTEGER NOT NULL,
                        praktikum_id INTEGER NOT NULL,
                        attendance_date DATE NOT NULL,
                        present_count INTEGER DEFAULT 0,
                        absent_count INTEGER DEFAULT 0,
                        late_count INTEGER DEFAULT 0,
                        notes TEXT,
                        submitted_by TEXT,
                        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (schedule_id) REFERENCES schedules(id),
                        FOREIGN KEY (group_id) REFERENCES groups(id),
                        FOREIGN KEY (praktikum_id) REFERENCES praktikum_categories(id)
                    )`,
                    (err) => {
                      if (err)
                        console.error(
                          "❌ Attendance table error:",
                          err.message
                        );
                      else console.log("✅ Attendance table ready");

                      // 6. MATERIALS TABLE (optional)
                      db.run(
                        `CREATE TABLE IF NOT EXISTS materials (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            praktikum_id INTEGER NOT NULL,
                            name TEXT NOT NULL,
                            quantity INTEGER DEFAULT 1,
                            unit TEXT,
                            status TEXT DEFAULT 'available',
                            notes TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (praktikum_id) REFERENCES praktikum_categories(id)
                        )`,
                        (err) => {
                          if (err)
                            console.error(
                              "❌ Materials table error:",
                              err.message
                            );
                          else console.log("✅ Materials table ready");

                          console.log("✅ All tables created successfully");
                          // Tambahkan kolom yang mungkin hilang
                          addMissingColumns();
                          insertDefaultData();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// FUNGSI UNTUK MENAMBAHKAN KOLOM YANG HILANG - VERSI SEDERHANA DAN AMAN
const addMissingColumns = () => {
  console.log("🔄 Checking and adding missing columns...");

  const alterStatements = [
    // Groups table columns
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS leader_nim TEXT DEFAULT ''",
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS leader_contact TEXT DEFAULT ''",
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS assistant_name TEXT DEFAULT ''",
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS assistant_nim TEXT DEFAULT ''",
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS assistant_contact TEXT DEFAULT ''",
    "ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",

    // Categories table columns
    "ALTER TABLE praktikum_categories ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",

    // Schedules table columns
    "ALTER TABLE schedules ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE schedules ADD COLUMN IF NOT EXISTS assistant TEXT DEFAULT ''",
  ];

  let completedCount = 0;

  alterStatements.forEach((sql, index) => {
    // Gunakan setTimeout untuk menghindari database locked
    setTimeout(() => {
      db.run(sql, function (err) {
        completedCount++;

        if (err) {
          // Jika error karena kolom sudah ada, itu normal
          if (
            err.message.includes("duplicate column") ||
            err.message.includes("already exists")
          ) {
            console.log(`ℹ️ Column already exists: ${sql.substring(0, 40)}...`);
          } else {
            console.log(`❌ Error executing: ${sql.substring(0, 40)}...`);
            console.log(`   Error details: ${err.message}`);
          }
        } else {
          console.log(`✅ Added column: ${sql.substring(0, 40)}...`);
        }

        // Cek jika semua sudah selesai
        if (completedCount === alterStatements.length) {
          console.log("✅ All columns check completed");
        }
      });
    }, index * 300); // Delay 300ms antara setiap query
  });
};

const insertDefaultData = () => {
  console.log("🔄 Inserting default data...");

  // 1. INSERT DEFAULT USERS
  const users = [
    {
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "admin",
      email: "admin@lab.com",
    },
    {
      username: "asisten",
      password: "asisten123",
      name: "Asisten Lab",
      role: "assistant",
      email: "asisten@lab.com",
    },
    {
      username: "dosen",
      password: "dosen123",
      name: "Dr. Budi Santoso",
      role: "lecturer",
      email: "dosen@lab.com",
    },
  ];

  let usersInserted = 0;
  users.forEach((user) => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);

    // Cek dulu apakah user sudah ada
    db.get(
      "SELECT id FROM users WHERE username = ?",
      [user.username],
      (err, row) => {
        if (err) {
          console.error(
            `❌ Error checking user ${user.username}:`,
            err.message
          );
          return;
        }

        if (!row) {
          db.run(
            "INSERT INTO users (username, password, name, role, email) VALUES (?, ?, ?, ?, ?)",
            [user.username, hashedPassword, user.name, user.role, user.email],
            (err) => {
              if (err) {
                console.error(
                  `❌ Error creating user ${user.username}:`,
                  err.message
                );
              } else {
                console.log(
                  `✅ User created: ${user.username}/${user.password}`
                );
              }
            }
          );
        } else {
          console.log(`ℹ️ User already exists: ${user.username}`);
        }
      }
    );
  });

  // 2. INSERT DEFAULT CATEGORIES (ditambahkan Informatika)
  const categories = [
    {
      name: "Praktikum Fisika Dasar",
      description: "Praktikum dasar fisika mekanika",
      max_participants: 20,
      color_code: "#3b82f6",
      duration_hours: 3,
    },
    {
      name: "Praktikum Kimia Dasar",
      description: "Praktikum dasar kimia analitik",
      max_participants: 18,
      color_code: "#10b981",
      duration_hours: 4,
    },
    {
      name: "Praktikum Biologi",
      description: "Praktikum biologi sel dan molekuler",
      max_participants: 15,
      color_code: "#8b5cf6",
      duration_hours: 3,
    },
    {
      name: "Praktikum Komputer",
      description: "Praktikum pemrograman dan jaringan",
      max_participants: 25,
      color_code: "#f59e0b",
      duration_hours: 2,
    },
    {
      name: "Praktikum Elektronika",
      description: "Praktikum rangkaian elektronik",
      max_participants: 12,
      color_code: "#ef4444",
      duration_hours: 4,
    },
    {
      name: "Informatika",
      description: "Praktikum IoT dan website",
      max_participants: 20,
      color_code: "#6366f1",
      duration_hours: 2,
    },
  ];

  // Delay untuk memastikan tabel sudah dibuat
  setTimeout(() => {
    categories.forEach((category, index) => {
      setTimeout(() => {
        db.get(
          "SELECT id FROM praktikum_categories WHERE name = ?",
          [category.name],
          (err, row) => {
            if (err) {
              console.error(
                `❌ Error checking category ${category.name}:`,
                err.message
              );
              return;
            }

            if (!row) {
              db.run(
                "INSERT INTO praktikum_categories (name, description, max_participants, color_code, duration_hours) VALUES (?, ?, ?, ?, ?)",
                [
                  category.name,
                  category.description,
                  category.max_participants,
                  category.color_code,
                  category.duration_hours,
                ],
                (err) => {
                  if (err) {
                    console.error(
                      `❌ Error creating category ${category.name}:`,
                      err.message
                    );
                  } else {
                    console.log(`✅ Category created: ${category.name}`);
                  }
                }
              );
            } else {
              console.log(`ℹ️ Category already exists: ${category.name}`);
            }
          }
        );
      }, index * 200);
    });

    // 3. INSERT DEFAULT GROUPS (dengan data yang lengkap)
    setTimeout(() => {
      const groups = [
        {
          group_name: "Kelompok 1-A",
          praktikum_id: 1,
          member_count: 5,
          leader_name: "Budi Santoso",
          leader_nim: "20210001",
          leader_contact: "081234567890",
          assistant_name: "Siti Aisyah",
          assistant_nim: "20200001",
          assistant_contact: "081234567891",
          email: "kelompok1a@example.com",
          notes: "Kelompok aktif",
        },
        {
          group_name: "Kelompok 1-B",
          praktikum_id: 1,
          member_count: 6,
          leader_name: "Siti Aisyah",
          leader_nim: "20210002",
          leader_contact: "081234567892",
          assistant_name: "Ahmad Wijaya",
          assistant_nim: "20200002",
          assistant_contact: "081234567893",
          email: "kelompok1b@example.com",
          notes: "",
        },
        {
          group_name: "Kelompok 2-A",
          praktikum_id: 2,
          member_count: 4,
          leader_name: "Ahmad Wijaya",
          leader_nim: "20210003",
          leader_contact: "081234567894",
          assistant_name: "Rina Melati",
          assistant_nim: "20200003",
          assistant_contact: "081234567895",
          email: "kelompok2a@example.com",
          notes: "Butuh alat tambahan",
        },
        {
          group_name: "Kelompok Komputer-1",
          praktikum_id: 4,
          member_count: 8,
          leader_name: "Rina Melati",
          leader_nim: "20210004",
          leader_contact: "081234567896",
          assistant_name: "Fajar Nugraha",
          assistant_nim: "20200004",
          assistant_contact: "081234567897",
          email: "kelkom1@example.com",
          notes: "Khusus praktikum jaringan",
        },
        {
          group_name: "Kelompok Elektro-1",
          praktikum_id: 5,
          member_count: 4,
          leader_name: "Fajar Nugraha",
          leader_nim: "20210005",
          leader_contact: "081234567898",
          assistant_name: "Budi Santoso",
          assistant_nim: "20200005",
          assistant_contact: "081234567899",
          email: "kelektro1@example.com",
          notes: "",
        },
        {
          group_name: "Kelompok Informatika-1",
          praktikum_id: 6, // ID untuk Informatika
          member_count: 6,
          leader_name: "Andi Pratama",
          leader_nim: "20210006",
          leader_contact: "081234567800",
          assistant_name: "Dewi Anggraini",
          assistant_nim: "20200006",
          assistant_contact: "081234567801",
          email: "kelinformatika1@example.com",
          notes: "Fokus IoT dan web development",
        },
      ];

      groups.forEach((group, index) => {
        setTimeout(() => {
          db.get(
            "SELECT id FROM groups WHERE group_name = ?",
            [group.group_name],
            (err, row) => {
              if (err) {
                console.error(
                  `❌ Error checking group ${group.group_name}:`,
                  err.message
                );
                return;
              }

              if (!row) {
                db.run(
                  `INSERT INTO groups (
                    group_name, praktikum_id, member_count, 
                    leader_name, leader_nim, leader_contact,
                    assistant_name, assistant_nim, assistant_contact,
                    email, notes, status
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    group.group_name,
                    group.praktikum_id,
                    group.member_count,
                    group.leader_name,
                    group.leader_nim,
                    group.leader_contact,
                    group.assistant_name,
                    group.assistant_nim,
                    group.assistant_contact,
                    group.email,
                    group.notes,
                    "active",
                  ],
                  (err) => {
                    if (err) {
                      console.error(
                        `❌ Error creating group ${group.group_name}:`,
                        err.message
                      );
                    } else {
                      console.log(`✅ Group created: ${group.group_name}`);
                    }
                  }
                );
              } else {
                console.log(`ℹ️ Group already exists: ${group.group_name}`);
              }
            }
          );
        }, index * 300);
      });

      // 4. INSERT DEFAULT SCHEDULES
      setTimeout(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        const dayNames = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        const dayName = dayNames[tomorrow.getDay()];

        const schedules = [
          {
            praktikum_id: 1,
            group_id: 1,
            schedule_date: tomorrowStr,
            day: dayName,
            start_time: "08:00",
            end_time: "11:00",
            room: "Lab Fisika Dasar",
            instructor: "Dr. Budi Santoso",
            assistant: "Siti Aisyah",
            status: "scheduled",
            notes: "Praktikum gaya dan momentum",
          },
          {
            praktikum_id: 2,
            group_id: 3,
            schedule_date: tomorrowStr,
            day: dayName,
            start_time: "13:00",
            end_time: "17:00",
            room: "Lab Kimia Dasar",
            instructor: "Prof. Siti Aisyah",
            assistant: "Ahmad Wijaya",
            status: "scheduled",
            notes: "Praktikum titrasi asam-basa",
          },
          {
            praktikum_id: 6, // Informatika
            group_id: 6, // Kelompok Informatika-1
            schedule_date: tomorrowStr,
            day: dayName,
            start_time: "09:00",
            end_time: "11:00",
            room: "Lab Komputer 3",
            instructor: "Dr. Andi Pratama",
            assistant: "Dewi Anggraini",
            status: "scheduled",
            notes: "Praktikum IoT dasar dan website",
          },
        ];

        schedules.forEach((schedule, index) => {
          setTimeout(() => {
            // Cek apakah jadwal sudah ada
            db.get(
              `SELECT id FROM schedules 
               WHERE praktikum_id = ? AND group_id = ? AND schedule_date = ?`,
              [
                schedule.praktikum_id,
                schedule.group_id,
                schedule.schedule_date,
              ],
              (err, row) => {
                if (err) {
                  console.error("❌ Error checking schedule:", err.message);
                  return;
                }

                if (!row) {
                  db.run(
                    `INSERT INTO schedules (
                      praktikum_id, group_id, schedule_date, day, 
                      start_time, end_time, room, instructor, assistant, 
                      status, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      schedule.praktikum_id,
                      schedule.group_id,
                      schedule.schedule_date,
                      schedule.day,
                      schedule.start_time,
                      schedule.end_time,
                      schedule.room,
                      schedule.instructor,
                      schedule.assistant,
                      schedule.status,
                      schedule.notes,
                    ],
                    (err) => {
                      if (err) {
                        console.error(
                          "❌ Error creating schedule:",
                          err.message
                        );
                      } else {
                        console.log(`✅ Schedule created for ${schedule.room}`);
                      }
                    }
                  );
                } else {
                  console.log(
                    `ℹ️ Schedule already exists for ${schedule.room}`
                  );
                }
              }
            );
          }, index * 400);
        });

        // Final message
        setTimeout(() => {
          console.log("\n" + "=".repeat(50));
          console.log("✅ DATABASE INITIALIZATION COMPLETE!");
          console.log("=".repeat(50));
          console.log("\n📊 DEFAULT DATA SUMMARY:");
          console.log(
            "- Users: admin/admin123, asisten/asisten123, dosen/dosen123"
          );
          console.log("- 6 Praktikum categories including 'Informatika'");
          console.log("- 6 Sample groups with complete data");
          console.log("- 3 Sample schedules");
          console.log("\n🔑 LOGIN CREDENTIALS:");
          console.log("• Username: admin");
          console.log("• Password: admin123");
          console.log("=".repeat(50));
        }, 2000);
      }, 2000); // Delay setelah groups
    }, 2000); // Delay setelah categories
  }, 1000); // Delay awal
};

// Export database object and functions
module.exports = {
  db,
  initializeDatabase,
};

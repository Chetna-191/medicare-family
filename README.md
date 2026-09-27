# MediCare Family 🩺

> **Medicine Reminder & Family Schedule Manager**  
> A full-stack web application built with **React (TypeScript) + Node/Express (TypeScript) + Prisma ORM (SQLite/PostgreSQL)**.

---

## 🌟 Key Features

1. **Family Member Management (CRUD)**:
   - Create, edit, and delete family profiles with name, relation (e.g. Grandfather, Mother, Son), age, and theme color tags.
   - Individual member view with complete active prescriptions, adherence history, and quick schedule actions.

2. **Medicine & Prescription Management (CRUD)**:
   - Schedule medications per family member with name, dosage (e.g. `500mg`, `1 tablet`), custom instructions (e.g. `With breakfast`), start date, and optional end date (or continuous/long-term regimen).
   - Multi-timing support: Add multiple daily doses with fast presets (`Morning 08:00`, `Noon 13:00`, `Afternoon 17:00`, `Night 20:30`) or custom time picker in 24-hour format.

3. **Strict Backend Validation**:
   - **Duplicate Medicine Prevention**: Automatically blocks adding a medicine with the same name for the same member during an overlapping date interval.
   - **Conflicting Timing Validation**: Blocks duplicate timing entries and invalid time formats (`HH:mm`).

4. **Daily Schedule View**:
   - Live view of all medication doses due today across all family members, grouped by member or chronological timeline.
   - Date switcher with quick navigation (**Today**, **Yesterday**, **Tomorrow**, or custom Date Picker).
   - Filters by family member and time of day (Morning / Afternoon / Evening).

5. **Interactive Dose Logging**:
   - 1-Click **"Mark Taken"** with celebration confetti animation, audio/visual cues, and timestamp logging.
   - **"Skip"** and **"Undo"** actions with toast notifications and live progress updates.

6. **Adherence Analytics Dashboard**:
   - Per-member weekly compliance percentage with animated progress rings.
   - Consecutive streak tracking (e.g., *6-day streak*).
   - Interactive **Bar Chart** & **Line Chart** (powered by Recharts) showing daily scheduled vs. taken doses over 7 to 14 days.
   - 7-day status breakdown matrix with daily checkmarks.

7. **Authentication & Demo Mode**:
   - Secure JWT-based authentication (register / login).
   - **1-Click Demo Login** pre-loaded with **The Miller Family** (`demo@medicare.family` / `demo1234`), 3 members, 8 active prescriptions, and 7-day adherence history!

---

## 🗄️ Database Schema (Prisma)

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  password      String
  name          String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  familyMembers FamilyMember[]

  @@map("users")
}

model FamilyMember {
  id          String     @id @default(uuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  relation    String     // e.g. "Father", "Mother", "Self", "Child", "Grandparent"
  age         Int
  avatarColor String     @default("emerald")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  medicines   Medicine[]

  @@map("family_members")
}

model Medicine {
  id           String           @id @default(uuid())
  memberId     String           @map("member_id")
  member       FamilyMember     @relation(fields: [memberId], references: [id], onDelete: Cascade)
  name         String
  dosage       String           // e.g. "500mg", "1 tablet"
  instructions String?          // e.g. "After breakfast"
  startDate    DateTime         @map("start_date")
  endDate      DateTime?        @map("end_date")
  colorTag     String           @default("blue")
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  timings      MedicineTiming[]
  doseLogs     DoseLog[]

  @@map("medicines")
}

model MedicineTiming {
  id         String   @id @default(uuid())
  medicineId String   @map("medicine_id")
  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)
  time       String   // "HH:mm" (e.g. "08:00", "20:00")
  createdAt  DateTime @default(now())

  @@map("medicine_timings")
}

model DoseLog {
  id            String    @id @default(uuid())
  medicineId    String    @map("medicine_id")
  medicine      Medicine  @relation(fields: [medicineId], references: [id], onDelete: Cascade)
  scheduledDate String    @map("scheduled_date") // "YYYY-MM-DD"
  scheduledTime String    @map("scheduled_time") // "HH:mm"
  status        String    @default("pending")    // "pending" | "taken" | "skipped" | "missed"
  takenAt       DateTime? @map("taken_at")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([medicineId, scheduledDate, scheduledTime])
  @@map("dose_logs")
}
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the root directory:
npm run install:all
```

### 2. Database Migration & Seeding
```bash
# Sync schema and load demo family data:
npm run prisma:migrate
npm run prisma:seed
```

### 3. Run Application
```bash
# Starts Express API (:5000) and Vite React Frontend (:5173) concurrently:
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser and click **"Sign In as Demo Family (1-Click)"** to explore immediately!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new family account |
| `POST` | `/api/auth/login` | Sign in with email & password |
| `GET` | `/api/auth/me` | Fetch authenticated profile |
| `GET` | `/api/members` | Get all family members with medicines |
| `GET` | `/api/members/:id` | Get single member details & history |
| `POST` | `/api/members` | Add new family member |
| `PUT` | `/api/members/:id` | Update family member |
| `DELETE`| `/api/members/:id` | Delete family member & cascade |
| `GET` | `/api/medicines` | List all medicines (optional `?memberId=`) |
| `POST` | `/api/medicines` | Create medicine with timings & validation |
| `PUT` | `/api/medicines/:id` | Update medicine & re-validate |
| `DELETE`| `/api/medicines/:id` | Delete medicine |
| `GET` | `/api/schedule?date=YYYY-MM-DD` | Get aggregated daily schedule & metrics |
| `POST` | `/api/schedule/status` | Mark dose status (`taken`, `skipped`, `pending`) |
| `GET` | `/api/adherence?days=7` | Get adherence stats, streaks, & chart dataset |

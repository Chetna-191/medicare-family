# 🩺 MediCare Family — Complete User Manual & Technical Architecture Guide

---

## 📖 1. What is MediCare Family?

**MediCare Family** is a full-stack, responsive healthcare companion web application built to help families systematically organize, schedule, track, and monitor medications across multiple family members in a single shared dashboard.

### Core Problems Solved:
1. **Missed or Duplicate Doses:** Prevents missed doses with clear daily schedules and prevents dangerous accidental double-prescriptions through intelligent backend validation.
2. **Multi-Member Scheduling:** Manages distinct routines for elderly grandparents, parents, and children within a single unified family account.
3. **Adherence & Health Accountability:** Tracks 7-day and 14-day compliance rates, consecutive streak counts, and interactive visual charts to keep family members accountable.

---

## 🛠️ 2. Technology Stack Used

| Layer | Technologies / Libraries | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18** with **TypeScript** | Type-safe, component-driven reactive user interface |
| **Build Tool** | **Vite** | Ultra-fast HMR (Hot Module Replacement) and optimized bundling |
| **Styling & Design** | **Tailwind CSS** + Custom Health Palette | Modern, accessible health UI with responsive design tokens |
| **UI Icons & Animations** | **Lucide React** + **Framer Motion** + **Canvas Confetti** | Smooth micro-animations, interactive transitions, and dose celebration effects |
| **Data Visualization** | **Recharts** | Interactive Bar Charts & Line Charts for adherence analytics |
| **Backend Framework** | **Node.js** with **Express** & **TypeScript** | Robust, scalable RESTful API server with custom middlewares |
| **Database & ORM** | **Prisma ORM** + **SQLite** *(PostgreSQL compatible)* | Type-safe database queries, schema migrations, and relation cascading |
| **Security & Auth** | **JWT (JSON Web Tokens)** + **Bcrypt.js** | Secure stateless authentication and salted password hashing |
| **Utility Libraries** | **date-fns** | Accurate timezone-safe date manipulation and interval checking |

---

## 🚀 3. Step-by-Step Guide: How to Operate Every Page & Function

---

### Step 1: Account Access & Login (`/login`)

When opening the website (`http://localhost:5173`), you will land on the Authentication portal.

#### A. 1-Click Fast Demo Sign In (Recommended for Instant Testing)
1. At the top of the login card, click the purple banner button: **"Sign In as Demo Family (1-Click)"**.
2. **Result:** Instantly logs you into **The Miller Family** pre-loaded with:
   - **3 Family Members:** Arthur Miller (Grandfather, 72), Sarah Miller (Mother, 42), Leo Miller (Son, 8).
   - **8 Active Prescriptions:** Multi-timing regimens with start and end dates.
   - **7-Day Compliance History:** Pre-populated dose logs and streak counts.

#### B. Sign In with Existing Credentials
1. Enter your **Email Address** (e.g. `demo@medicare.family`) and **Password** (e.g. `demo1234`).
2. Click **"Sign In to Dashboard"**.

#### C. Create a New Family Account
1. Click the link at the bottom: **"Don't have an account yet? Create one"**.
2. Fill in:
   - **Family / Account Name:** e.g., *The Sharma Family*
   - **Email Address:** e.g., *contact@sharma.family*
   - **Password:** Minimum 6 characters.
3. Click **"Create Family Account"**. You will be logged in automatically with a fresh dashboard.

---

### Step 2: Main Dashboard & Daily Schedule (`/`)

The Dashboard is your daily control center for medicine management.

#### 1. Daily Progress Bar & Summary
* Displays today's total scheduled doses, taken doses, and overall daily compliance percentage.
* Shows quick status counts: **Pending**, **Taken**, and **Skipped**.

#### 2. Date Navigation
* **Quick Buttons:** Click **"Yesterday"**, **"Today"**, or **"Tomorrow"** to navigate fast.
* **Custom Calendar Picker:** Click the date input to inspect historical or upcoming medication schedules on any date.

#### 3. Filtering & View Controls
* **Filter by Member:** Click dropdown to filter doses for a specific family member (e.g., *Only Arthur*) or select *All Family Members*.
* **Filter by Time of Day:** Toggle between *All Day*, *Morning (00:00 - 11:59)*, *Afternoon (12:00 - 16:59)*, or *Evening (17:00 - 23:59)*.

#### 4. Logging Doses (Mark Taken / Skip / Undo)
* **Mark Taken (1-Click):** Click the green **"Mark Taken"** button on any pending medicine card.
  - 🎊 Triggers a celebratory confetti animation.
  - Updates the dose badge to **Taken** with a real-time timestamp.
  - Increases the daily progress bar immediately.
* **Skip Dose:** Click the subtle **"Skip"** button if a doctor advised holding the dose.
* **Undo / Reset:** If clicked by mistake, click **"Undo"** to reset the dose back to pending.

---

### Step 3: Family Members Management (`/members`)

Manage all individuals registered under your family account.

#### 1. Adding a Family Member
1. Click **"+ Add Member"** in the top navbar or the members page.
2. In the modal dialog, fill in:
   - **Full Name:** e.g., *Grandma Rose*
   - **Relationship:** Select from dropdown (*Self, Spouse, Mother, Father, Grandparent, Child, Other*).
   - **Age:** e.g., *68*
   - **Avatar Color Theme:** Select from color swatches (Indigo, Emerald, Sky, Rose, Amber, Purple).
3. Click **"Add Member"**.

#### 2. Viewing Member Profiles
* Click on any member card to navigate to their dedicated **Member Profile (`/members/:id`)**.
* View their:
  - Total active prescriptions.
  - Adherence rate.
  - Complete list of active medications with timings and dosages.
  - Quick button to **"+ Schedule Medicine"** directly for this member.

#### 3. Editing or Removing Members
* Click the **Edit (Pencil)** icon to update name, age, or avatar color.
* Click the **Delete (Trash)** icon to remove the profile (this will safely cascade delete their scheduled medications and logs).

---

### Step 4: Medicine & Prescription Scheduling (`/medicines`)

View and configure prescriptions with multi-timing doses and validation.

#### 1. Scheduling a New Medicine
1. Click **"+ Add Medicine"** in the top navigation bar.
2. Complete the form fields:
   - **Assign Member:** Select which family member takes this medicine.
   - **Medicine Name:** e.g., *Atorvastatin*
   - **Dosage:** e.g., *20mg* or *1 tablet*
   - **Special Instructions:** e.g., *Take at bedtime with water*
   - **Start Date & End Date:** Set start date. Check *"Ongoing / Long-term regimen"* if it has no fixed end date.
   - **Daily Doses & Timings:**
     - Click presets for fast entry: **Morning (08:00)**, **Noon (13:00)**, **Afternoon (17:00)**, **Night (20:30)**.
     - Or enter custom 24-hour time slots (e.g. `09:15`, `22:00`).
     - Click **"+ Add Timing Slot"** to schedule multiple doses per day.
3. Click **"Save Medicine Schedule"**.

#### 2. Built-in Smart Validation (Conflict Prevention)
* **Duplicate Medicine Protection:** If you attempt to add the same medicine name for the same member within overlapping dates, the system rejects it and alerts you.
* **Conflicting Timing Check:** Prevents duplicate time entries for the same day (e.g., adding `08:00` twice).

#### 3. Managing Prescriptions
* Filter medicine inventory by family member.
* Click **Edit** to modify dosage, instructions, or adjust timing schedules.
* Click **Delete** to discontinue a medication.

---

### Step 5: Adherence Analytics & Compliance Dashboard (`/adherence`)

Track long-term medication consistency and health habits.

#### 1. Compliance Metric Cards
* **Overall Compliance Score:** Calculated percentage of total scheduled doses taken vs. missed/skipped over the selected window.
* **Active Streak Counter:** Tracks consecutive days with 100% adherence (e.g. *🔥 6-Day Perfect Streak*).
* **Total Doses Taken vs. Scheduled:** Clear numerical breakdown.

#### 2. Time Window Switcher
* Toggle between **Last 7 Days** and **Last 14 Days** to analyze trends.

#### 3. Visual Charts (Recharts)
* **Scheduled vs. Taken Bar/Line Chart:** Side-by-side visualization of daily dosage adherence over the week.
* **Member Adherence Rings:** Visual radial progress meters showing which family members are keeping up best with their routines.

#### 4. 7-Day Status Breakdown Matrix
* A grid showing each day of the week with status badges for every family member, highlighting perfect adherence days and missed doses.

---

## 🔒 4. Security & Isolation Architecture

1. **User Isolation:** All queries automatically enforce `where: { userId }` at the database level. No user can view or alter another family's records.
2. **Password Security:** Passwords are never stored in plain text; salted and hashed via `bcryptjs` with 10 salt rounds.
3. **JWT Bearer Authentication:** Secure HTTP Authorization headers validate every single API request.
4. **Cascade Integrity:** Deleting a member or medicine automatically cleans up associated timings and dose logs via Prisma foreign key cascade rules.

---

## 📋 5. Summary Cheat Sheet for Users

| What do you want to do? | Where to click? |
|---|---|
| **Check today's medicines** | Go to **Dashboard (`/`)** |
| **Mark a pill as taken** | Click **"Mark Taken"** (green button) on any dose card |
| **Add a new family profile** | Click **"+ Add Member"** in the top navbar |
| **Schedule a new prescription** | Click **"+ Add Medicine"** in the top navbar |
| **View 7-day compliance & streaks** | Click **"Adherence"** in the left sidebar |
| **Switch to a different date** | Use the **Date Switcher** buttons at the top of Dashboard |
| **Sign out or switch accounts** | Click **"Logout"** (top right profile badge) |

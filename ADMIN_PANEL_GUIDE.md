# ORBI City Hub - ADMIN Panel Access Guide

## 🔐 How to Access ADMIN Panel

### Method 1: Direct URL
Simply navigate to the ADMIN panel URL:
```
https://3000-ihj8x11ufcd1u5r41evif-c07f8853.manusvm.computer/admin
```

### Method 2: From Dashboard
1. Log in to ORBI City Hub
2. Click on your profile in the sidebar
3. If you have ADMIN role, you'll see "ADMIN Panel" option
4. Click to access

---

## 👤 ADMIN Role Assignment

Your account (`TAMAR MAKHARADZE`) is automatically assigned **ADMIN role** because you are the project owner.

To verify your ADMIN access:
1. Check the `role` field in the `users` table in Database Management
2. Your role should be `admin` (not `user`)

---

## 📊 ADMIN Panel Features

### 1. **Overview Tab**
- System status for all modules
- Quick stats (Reservations, Finance, Guests, Apartments)
- Recent activities log

### 2. **Reservations Tab**
- **Add New Reservation**: Click "+ New Reservation" button
  - Fill in: Guest Name, Room, Channel, Check-in, Check-out, Price
  - Click "Save"
- **Edit Reservation**: Click "Edit" button on any row
- **Delete Reservation**: Click "Delete" button (with confirmation)
- **Import Excel**: Click "Import Excel" to bulk upload reservations
  - Supported format: `.xlsx`, `.xls`, `.csv`
  - Required columns: `guest_name`, `room`, `channel`, `check_in`, `check_out`, `price`

### 3. **Finance Tab**
- **Add New Transaction**: Click "+ New Transaction" button
  - Fill in: Date, Category, Description, Amount
  - Click "Save"
- **Edit Transaction**: Click "Edit" button on any row
- **Delete Transaction**: Click "Delete" button
- **Import Excel**: Click "Import Excel" to bulk upload financial data
  - Supported format: `.xlsx`, `.xls`, `.csv`
  - Required columns: `date`, `category`, `description`, `amount`

### 4. **Marketing Tab**
- Manage marketing campaigns
- View campaign performance
- Edit campaign budgets and targets

### 5. **Logistics Tab**
- Manage cleaning schedules
- Update inventory levels
- Assign staff to tasks

### 6. **Database Tab**
- **SQL Query Executor**: Run custom SQL queries
  - Example: `SELECT * FROM users WHERE role = 'admin'`
  - Be careful! This has direct database access
- **Backup**: Create database backups
- **Restore**: Restore from previous backups

---

## 📤 Excel Import/Export

### Importing Data

**Step 1:** Prepare your Excel file with the correct columns

**Reservations Template:**
| guest_name | room | channel | check_in | check_out | price |
|------------|------|---------|----------|-----------|-------|
| John Doe | A 3041 | Booking.com | 2025-12-01 | 2025-12-05 | 450 |
| Jane Smith | C 2641 | Airbnb | 2025-12-10 | 2025-12-15 | 520 |

**Finance Template:**
| date | category | description | amount |
|------------|----------|-------------|--------|
| 2025-11-01 | Revenue | Booking.com payment | 18900 |
| 2025-11-05 | Expense | Cleaning supplies | -150 |

**Step 2:** Click "Import Excel" button in the respective tab

**Step 3:** Select your Excel file

**Step 4:** System will automatically parse and import the data

### Exporting Data

**Step 1:** Navigate to the tab you want to export (Reservations, Finance, etc.)

**Step 2:** Click "Export Excel" or "Export PDF" button

**Step 3:** File will be downloaded automatically

**Supported Export Formats:**
- Excel (`.xlsx`)
- CSV (`.csv`)
- PDF (`.pdf`)

---

## 🛠️ Common Admin Tasks

### Add a New Reservation
1. Go to ADMIN Panel → Reservations tab
2. Click "+ New Reservation"
3. Fill in all fields:
   - Guest Name: e.g., "John Doe"
   - Room: e.g., "A 3041"
   - Channel: e.g., "Booking.com"
   - Check-in: e.g., "2025-12-01"
   - Check-out: e.g., "2025-12-05"
   - Price: e.g., "450"
4. Click "Save"

### Bulk Upload Reservations from Excel
1. Prepare Excel file with columns: `guest_name`, `room`, `channel`, `check_in`, `check_out`, `price`
2. Go to ADMIN Panel → Reservations tab
3. Click "Import Excel"
4. Select your file
5. System will import all rows automatically

### Add Financial Transaction
1. Go to ADMIN Panel → Finance tab
2. Click "+ New Transaction"
3. Fill in:
   - Date: e.g., "2025-11-25"
   - Category: e.g., "Revenue" or "Expense"
   - Description: e.g., "Booking.com payment"
   - Amount: e.g., "18900" (positive for revenue, negative for expense)
4. Click "Save"

### Run SQL Query
1. Go to ADMIN Panel → Database tab
2. Enter your SQL query in the text area
3. Example queries:
   ```sql
   -- View all reservations
   SELECT * FROM reservations ORDER BY check_in DESC LIMIT 10;
   
   -- View financial summary
   SELECT category, SUM(amount) as total FROM financial_data GROUP BY category;
   
   -- View all users
   SELECT id, name, email, role FROM users;
   ```
4. Click "Execute Query"
5. Results will be displayed below

---

## ⚠️ Important Notes

1. **ADMIN Access Only**: Only users with `role = 'admin'` can access the ADMIN panel
2. **Data Validation**: Always check data format before importing Excel files
3. **Backup First**: Before running SQL queries or bulk operations, create a database backup
4. **Excel Format**: Use `.xlsx`, `.xls`, or `.csv` formats only
5. **Date Format**: Use `YYYY-MM-DD` format for dates (e.g., `2025-12-01`)
6. **Price Format**: Use numbers only, no currency symbols (e.g., `450` not `₾450`)

---

## 🔄 Data Sync

After adding/editing data in ADMIN panel:
1. Changes are immediately saved to the database
2. All dashboards will automatically update
3. No need to refresh the page manually
4. AI agents will have access to the new data

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Verify your ADMIN role in the Database tab
3. Ensure Excel files follow the correct format
4. Contact support at: info@orbicitybatumi.com

---

**Last Updated:** November 26, 2025
**Version:** 4.0

# ORBI City Hub - Feature Implementation TODO

## Activity Log System
- [x] Create activity_logs table schema (id, user_id, action_type, target_entity, target_id, old_value, new_value, ip_address, user_agent, created_at)
- [x] Build Activity Log timeline UI component
- [x] Add filters (by user, date, action type, module)
- [ ] Implement 90-day auto-cleanup cron job
- [x] Add soft rollback for internal DB changes
- [ ] Add compensation actions for external OTA changes
- [ ] Add Preview Mode for AI actions
- [x] Add Undo button (15 minute window)

## Notification Center
- [x] Create notifications table schema (id, user_id, type, title, message, read_at, action_url)
- [x] Build Bell icon + dropdown UI
- [ ] Implement Email notifications for Critical/Approval-required
- [ ] Add WhatsApp integration for Urgent only (optional)
- [ ] Implement Smart Batching (5-minute digest)

## Analytics Dashboard
- [x] Tasks Completed metric (today/week/month)
- [x] Approval Rate metric
- [x] Error Rate metric
- [x] Response Time metric
- [x] Simple cards UI + trend line chart

## White-Label Config (Phase 1)
- [x] Create settings table (logo_url, primary_color, company_name)
- [x] Implement CSS variables for theming
- [x] Build settings UI for customization

## Homepage Updates
- [x] Remove Real Finance Dashboard card from homepage
- [x] Update financial data with Nov 2024 - Nov 2025 report
- [x] Update Finance module with new data

## Power BI-Level Finance Module
- [x] Create interactive month/year filter dropdowns
- [ ] Add date range picker for custom periods
- [x] Implement sortable data tables
- [x] Build KPI cards with sparklines
- [x] Create revenue/profit trend charts
- [x] Add expense breakdown pie chart
- [x] Build occupancy rate gauge
- [ ] Implement studio growth visualization
- [x] Add profit distribution chart (Company vs Owners)
- [ ] Create cost optimization analysis view
- [ ] Add export to Excel/PDF functionality
- [ ] Implement comparison mode (month vs month)

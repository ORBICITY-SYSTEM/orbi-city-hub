# Legacy Archive

This folder contains deprecated files that were moved during the PowerStack refactor.
These files are kept for reference but are no longer used in the active codebase.

## Archived Files

### Server Parsers (Disconnected)
- `server/gmailBookingParser.ts` - Email parsing logic (replaced by Google Sheet bridge)
- `server/otelmsParser.ts` - OtelMS parsing (replaced by manual data bridge)
- `server/outscraper.test.ts` - Outscraper tests
- `server/utils/excelParser.ts` - Excel file parser
- `server/utils/financialExcelParser.ts` - Financial Excel parser

### AppScript (Deprecated)
- `docs/appscript/ExpediaEmailParser.gs` - Expedia email parsing script

### Data Files (No Longer Used)
- `root_files/outscraper-reviews.xlsx` - Old review data
- `root_files/outscraper-task-result.json` - Outscraper task results
- `root_files/orbi-reviews.xlsx` - Legacy review Excel file
- `root_files/update_ota_stats.sql` - OTA stats SQL script

### Documentation (Outdated)
- `docs/outscraper-api-key.md` - Outscraper API documentation
- `docs/outscraper-config.md` - Outscraper configuration

## Why Archived?

These files were causing instability due to:
1. Email parsing dependencies that could fail
2. Excel file dependencies that required manual updates
3. Direct database SQL that bypassed the application layer

The new architecture uses:
- Google Sheet as "Single Source of Truth"
- Mock data fallback for demo mode
- Direct AI integration without file dependencies

---
Archived: December 2024

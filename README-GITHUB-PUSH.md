# GitHub Push Script

## Setup

1. Token-ი შენახულია `.github-config.ps1` ფაილში (ეს ფაილი არის `.gitignore`-ში, ასე რომ არ დაემატება Git-ში)

2. **პირველად გამოყენებისას:**
   - გაუშვი `.\push-to-github.ps1`
   - თუ config არ არსებობს, შეიქმნება template
   - დაამატე შენი GitHub token-ი `.github-config.ps1` ფაილში

## Usage

### ერთი ფაილის push:
```powershell
.\push-to-github.ps1 -Path "client\src\App.tsx" -CommitMessage "Update App.tsx"
```

### ყველა ფაილის push:
```powershell
.\push-to-github.ps1 -All
```

### Custom files push:
```powershell
# შეცვალე script-ში $files array
.\push-to-github.ps1 -All
```

## Security

- `.github-config.ps1` არის `.gitignore`-ში
- Token არასოდეს არ დაემატება Git-ში
- Token შეგიძლია შეცვალო ნებისმიერ დროს `.github-config.ps1`-ში

# Google Cloud Service Account Key

## 📝 How to Add Your Credentials

**File:** `service-account-key.json`

### Option 1: Replace Entire File
1. Open `service-account-key.json`
2. **Delete everything**
3. **Paste your entire Google Cloud JSON credentials**
4. Save the file

### Option 2: Copy from Google Cloud Console
1. Go to: https://console.cloud.google.com
2. Navigate to: **IAM & Admin** → **Service Accounts**
3. Click on your service account (or create one)
4. Click **Keys** tab → **Add Key** → **Create New Key** → **JSON**
5. Download the JSON file
6. **Copy the entire contents** of downloaded file
7. **Paste into** `service-account-key.json` (replacing template)

---

## 🔧 What Your File Should Look Like

```json
{
  "type": "service_account",
  "project_id": "your-project-123456",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/...",
  "universe_domain": "googleapis.com"
}
```

---

## ✅ After Pasting Credentials

1. **Save the file**
2. **Restart the server:**
   ```bash
   pkill -9 node
   cd /Users/ayushchaudhary/Projects/Speakwise-Challenge
   node server/index.js
   ```
3. **Test:** Record new audio at http://localhost:3000
4. **Verify:** Check logs for "Transcription: [your actual words]"

---

## 🔒 Security Notes

- ✅ This file is in `.gitignore` (won't be committed to Git)
- ✅ Keep credentials private
- ✅ Don't share this file
- ✅ Rotate keys if exposed

---

## 🐛 Troubleshooting

### "File not found" Error?
- Check file is named exactly: `service-account-key.json`
- Check it's in the `config/` directory
- No extra spaces in filename

### "Invalid credentials" Error?
- Verify JSON is valid (use online JSON validator)
- Check you copied the ENTIRE file
- Make sure no extra characters at start/end
- Verify Speech-to-Text API is enabled in Google Cloud Console

### Still Using Mock Transcripts?
If you see: `📝 Generated mock transcript for testing`
- Credentials file might not be valid
- Check server logs for errors
- Verify API is enabled in Google Cloud

---

## 📚 Enable Speech-to-Text API

If you haven't already:

1. Go to: https://console.cloud.google.com/apis/library
2. Search: **"Cloud Speech-to-Text API"**
3. Click **Enable**
4. Wait 2-3 minutes for activation
5. Create service account key (if you haven't)

---

## ✅ Verification

After adding credentials, you should see in logs:

```
🎤 Starting evaluation for participant [ID]
Transcription: [YOUR ACTUAL WORDS FROM RECORDING]
✅ Transcription done in 3500ms
✅ AI Evaluation done in 250ms
✅ Total processing time: 3.8s
```

**NOT:**
```
📝 Generated mock transcript for testing
```

---

## 🎯 Quick Start

1. **Paste your credentials** into `service-account-key.json`
2. **Restart server:** `pkill -9 node && node server/index.js`
3. **Record audio** at http://localhost:3000
4. **Get real transcription!** ✨

# Backend Endpoint Specification

## Backend URL

**Production:** `https://noir-prover.zk.email`

## Quick Reference

The frontend makes requests to these backend endpoints:

### 1. Initiate Gmail OAuth

```
GET /gmail/auth?query={gmail_search}&blueprint={blueprint_id}&command={command}&handle={social_handle}
```

**Parameters:**

- `query` - Gmail search string (e.g., `from:discord.com subject:"Password Reset Request for Discord"`)
- `blueprint` - ZK Email blueprint ID (e.g., `zkemail/discord@v1`)
- `command` - Command for the proof (e.g., `withdraw`)
- `handle` (optional) - Social media handle to claim (e.g., `LajosTaken`)

**Examples:**

```bash
# Discord
GET https://noir-prover.zk.email/gmail/auth?query=from:discord.com%20subject:"Password%20Reset%20Request%20for%20Discord"&blueprint=zkemail/discord@v1&command=withdraw&handle=MyDiscordUser

# Twitter/X
GET https://noir-prover.zk.email/gmail/auth?query=from:info@x.com%20subject:"password%20reset"&blueprint=benceharomi/x_handle@v1&command=withdraw&handle=LajosTaken

# GitHub
GET https://noir-prover.zk.email/gmail/auth?query=from:github.com&blueprint=benceharomi/github_handle@v1&command=withdraw&handle=myusername

# Reddit
GET https://noir-prover.zk.email/gmail/auth?query=from:reddit.com&blueprint=benceharomi/reddit_handle@v1&command=withdraw&handle=myreddituser
```

**Backend Response:**

- Redirect user to Google OAuth consent screen

---

### 2. Google OAuth Callback (Internal)

```
GET /auth/google/callback
```

This is the internal endpoint that Google calls after OAuth. Backend should:

1. Exchange authorization code for access token
2. Use stored `query` from session to search Gmail
3. Fetch the matching email(s)
4. Store email data with unique `proofId`
5. Redirect back to frontend callback

**Redirect Format:**

Backend redirects directly to the claim page:

```
{frontend_url}/claim?proofId={unique_id}

# Success Example
http://localhost:5173/claim?proofId=2e93ba29-6136-4212-85aa-62371794d056

# Error Example
http://localhost:5173/claim?error=no_emails_found
```

---

### 3. Fetch Proof Data

```
GET /proof/:proofId
```

**URL Parameters:**

- `proofId` - The unique proof identifier

**Response:**

```json
{
  "success": true,
  "id": "2e93ba29-6136-4212-85aa-62371794d056",
  "timestamp": "2025-11-18T20:08:19.749Z",
  "handle": "LajosTaken",
  "email": {
    "id": "1999af218158b54b",
    "raw": "Delivered-To: user@gmail.com\r\nReceived: by...[full raw .eml content]"
  },
  "proof": [
    "0x00000000000000000000000000000097e202df97fb2ec7f84fa0563a3d9c794e",
    "0x..."
  ],
  "publicInputs": [
    "0x0462b6e208f3552371d7c7d2fbeb31691e5f789b9e5f0bdfaa68a6a84f01d9aa",
    "0x..."
  ]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Proof not found or expired"
}
```

**Notes:**

- Returns full email raw content and **ready-to-use ZK proof**
- `handle`: Extracted social media username (e.g., Twitter handle "LajosTaken")
- `proof`: Array of hex strings representing the zero-knowledge proof
- `publicInputs`: Public inputs for on-chain verification
- Frontend extracts `handle` to auto-populate the claim form
- Frontend transforms `proof` + `publicInputs` into format for smart contract submission
- **No frontend proof generation needed** - backend handles all ZK computation!

---

## Data Flow

```
1. User clicks "Sign in with Google"
         ↓
2. Frontend → GET /gmail/auth?query=from:discord.com...&blueprint=zkemail/discord@v1&command=withdraw
         ↓
3. Backend → Redirect to Google OAuth
         ↓
4. User grants permission
         ↓
5. Google → Backend OAuth callback
         ↓
6. Backend:
   - Exchange code for token
   - Search Gmail with query
   - Fetch matching email
   - Generate ZK proof
   - Store proof data → proofId
   - Redirect to: {frontend}/claim?proofId=abc123
         ↓
7. Frontend Claim page → Receives ?proofId=abc123
         ↓
8. Frontend → GET /proof/abc123
         ↓
9. Backend → Returns { success: true, email: { raw: "..." }, proof: {...} }
         ↓
10. Frontend → Converts email.raw to .eml File → Continue with existing flow
```

---

## 🎯 Platform-Specific Configuration

Frontend sends platform-specific parameters:

| Platform    | Query                                                           | Blueprint                      |
| ----------- | --------------------------------------------------------------- | ------------------------------ |
| X (Twitter) | `from:info@x.com subject:"password reset"`                      | `benceharomi/x_handle@v1`      |
| Discord     | `from:discord.com subject:"Password Reset Request for Discord"` | `zkemail/discord@v1`           |
| GitHub      | `from:github.com`                                               | `benceharomi/github_handle@v1` |
| Reddit      | `from:reddit.com`                                               | `benceharomi/reddit_handle@v1` |

**Command:** All platforms use `withdraw` command for claiming tips.

---

## 🔒 Security Notes

### Proof Storage

- **Temporary**: Store with 1-hour TTL
- **One-time use**: Delete after fetch
- **Isolated**: Each proofId should be unique and unguessable
- **No PII leakage**: Don't log email contents

### CORS

Backend must allow frontend origin:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
```

---

## Testing

### Test Discord Flow

```bash
# 1. Frontend initiates
https://noir-prover.zk.email/gmail/auth?query=from:discord.com%20subject:"Password%20Reset%20Request%20for%20Discord"&blueprint=zkemail/discord@v1&command=withdraw

# 2. After OAuth, backend redirects to:
http://localhost:5173/claim?proofId=2e93ba29-6136-4212-85aa-62371794d056

# 3. Frontend fetches proof:
curl https://noir-prover.zk.email/proof/2e93ba29-6136-4212-85aa-62371794d056
```

### Test Error Cases

```bash
# Invalid proofId
curl https://noir-prover.zk.email/proof/invalid-id
# Should return { success: false, error: "..." }

# Valid proof fetch
curl https://noir-prover.zk.email/proof/a458b5a0-fb7c-4a39-b67a-3f07774c437c
# Should return { success: true, email: {...}, proof: {...} }
```

---

## Environment Variables

### Frontend

```env
VITE_BACKEND_URL=https://noir-prover.zk.email
```

---

## Quick Start

1. **Frontend Setup:**

   ```bash
   # Create .env file
   cp sample.env .env

   # Backend URL is already set to production
   # VITE_BACKEND_URL=https://noir-prover.zk.email

   # Start dev server
   bun run dev
   ```

2. **Test:**

   - Navigate to http://localhost:5173/claim
   - Click "Sign in with Google"
   - Complete OAuth flow
   - Verify email appears

3. **For Local Backend Development:**
   ```bash
   # Override in .env for local testing
   echo "VITE_BACKEND_URL=http://localhost:3000" >> .env
   ```

---

## Status Codes

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| 302  | Redirect to Google OAuth or frontend callback |
| 200  | Proof data retrieved successfully             |
| 404  | Proof not found or expired                    |
| 400  | Bad request (missing parameters)              |
| 401  | OAuth failed (invalid credentials)            |
| 500  | Server error                                  |

---

**Last Updated:** 2025-01-18

**Backend:** The backend is already deployed at `https://noir-prover.zk.email` - no backend setup required!

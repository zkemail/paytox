# Backend Proof Integration - Complete Guide

## Overview

The frontend now fully integrates with the backend's pre-generated ZK proofs, eliminating the need for frontend proof generation. Users can sign in with Google, and the backend handles OAuth, email fetching, and proof generation automatically.

## 🎯 Key Features

### 1. **Backend-Generated Proofs**
- Backend generates ZK proofs automatically
- No cryptographic computation on the frontend
- Instant claim page population with proof data

### 2. **Auto-Populated Handle**
- Backend extracts social media handle from email
- Frontend automatically fills in the username field
- Example: `"LajosTaken"` from X/Twitter password reset email

### 3. **Direct-to-Withdrawal Flow**
```
User enters handle (optional) + clicks "Sign in with Google"
         ↓
Frontend sends handle to backend OAuth endpoint
         ↓
Backend OAuth + Email Fetch + Proof Generation
         ↓
Redirect to /claim?proofId=...
         ↓
Frontend fetches proof data
         ↓
Auto-populate handle + Set proof
         ↓
User immediately ready to withdraw! 🎉
```

## 📡 API Integration

### Backend Response Format

```json
{
  "success": true,
  "id": "2e93ba29-6136-4212-85aa-62371794d056",
  "timestamp": "2025-11-18T20:08:19.749Z",
  "handle": "LajosTaken",
  "email": {
    "id": "1999af218158b54b",
    "raw": "Delivered-To: lajos.taken@gmail.com\r\n..."
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

### Frontend Processing

1. **Extract Handle**
   ```typescript
   if (proofData.handle) {
     setHandle(proofData.handle); // Auto-populate username
   }
   ```

2. **Transform Proof Format**
   ```typescript
   const { hexlify, concat } = await import("ethers");
   const proofDataHex = hexlify(concat(proofData.proof));
   const transformedProof = {
     props: {
       proofData: proofDataHex,
       publicOutputs: proofData.publicInputs,
     },
   };
   ```

3. **Set Result for Withdrawal**
   ```typescript
   setResult({
     proof: transformedProof,
     verification: { verified: true },
   });
   setContractAddress(contract.entrypoint);
   ```

## 🔧 Modified Files

### 1. **`src/features/claim/Claim.tsx`**
- Added `handleGoogleSuccess()` to process backend proof response
- Extracts `handle` and auto-populates form
- Transforms `proof` + `publicInputs` into contract-ready format
- Sets result directly, bypassing frontend proof generation

### 2. **`src/features/twitter/useTwitterProof.ts`**
- Exposed `setResult()` for external proof injection
- Exposed `setContractAddress()` for contract configuration
- Allows backend-provided proofs to integrate seamlessly

### 3. **`src/components/GoogleAuthBackend.tsx`**
- Handles "Sign in with Google" button
- Opens OAuth popup to backend's `/gmail/auth` endpoint
- Listens for `postMessage` callback with `proofId`
- Passes `query`, `blueprint`, `command`, and `handle` (optional) parameters
- Frontend can optionally send user's handle to backend for validation/pre-filling

### 4. **`ENDPOINT_SPEC.md`**
- Updated response format documentation
- Added `handle` field description
- Clarified that backend returns ready-to-use proofs
- Updated examples with real backend URLs

## 🚀 User Flow

### Step-by-Step Experience

1. **User visits Claim page** (`/claim`)
   - Sees "Sign in with Google" button
   - Platform selector (X, Discord, GitHub, Reddit)

2. **User clicks "Sign in with Google"**
   - Frontend sends handle (if entered) along with OAuth request
   - Popup opens to `https://noir-prover.zk.email/gmail/auth?query=...&blueprint=...&command=withdraw&handle=LajosTaken`
   - User logs into Google
   - User grants Gmail read permission

3. **Backend processes**
   - Fetches password reset email
   - Extracts handle (e.g., "LajosTaken")
   - Generates ZK proof
   - Stores proof with unique `proofId`

4. **Backend redirects**
   - Redirects popup to `/claim?proofId=2e93ba29-6136-4212-85aa-62371794d056`
   - Popup sends `postMessage` to parent window
   - Popup closes automatically

5. **Frontend processes**
   - Fetches proof from `https://noir-prover.zk.email/proof/2e93ba29-6136-4212-85aa-62371794d056`
   - Extracts `handle` → auto-fills username field
   - Transforms `proof` + `publicInputs` → sets result
   - User sees "✅ Proof received from backend - ready for withdrawal!"

6. **User enters withdrawal address**
   - Types ENS name or Ethereum address
   - Clicks "Withdraw"
   - ZeroDev creates account abstraction wallet
   - Smart contract verifies proof + transfers funds
   - Success! 🎉

## 🔐 Security

- **CSRF Protection**: Backend handles OAuth state
- **Origin Verification**: `postMessage` validates origin
- **One-Time Use**: proofId consumed after fetch (optional backend enforcement)
- **ZK Verification**: On-chain proof verification ensures authenticity

## 🌐 Environment Variables

```env
# Backend server URL (production default)
VITE_BACKEND_URL=https://noir-prover.zk.email
```

## 📊 Platform Configuration

Each platform has specific Gmail queries and blueprint IDs:

| Platform | Query | Blueprint |
|----------|-------|-----------|
| X (Twitter) | `from:info@x.com subject:"password reset"` | `zkemail/x@v2` |
| Discord | `from:discord.com subject:"Password Reset Request for Discord"` | `zkemail/discord@v1` |
| GitHub | `from:github.com` | `zkemail/github@v1` |
| Reddit | `from:reddit.com` | `zkemail/reddit@v1` |

## 🧪 Testing

### Local Development

1. **Set backend URL** (if not using production):
   ```bash
   echo "VITE_BACKEND_URL=http://localhost:3000" > .env
   ```

2. **Run dev server**:
   ```bash
   bun run dev
   ```

3. **Test OAuth flow**:
   - Navigate to `/claim`
   - Select platform (X)
   - Click "Sign in with Google"
   - Complete OAuth in popup
   - Verify handle is auto-populated
   - Verify proof is ready for withdrawal

### Production

- Backend: `https://noir-prover.zk.email`
- Frontend: Uses production backend by default
- No setup required!

## 💡 Benefits

1. **⚡ Speed**: No frontend proof generation = instant claims
2. **📱 Mobile-Friendly**: Lightweight frontend, no heavy cryptography
3. **🔒 Secure**: Backend-controlled OAuth, validated proofs
4. **😊 UX**: Auto-populated handle, one-click sign-in
5. **🌍 Scalable**: Backend can optimize proof generation
6. **✅ Validation**: Frontend can send handle to backend for pre-validation during OAuth

## 🎓 Technical Details

### Proof Transformation

The backend returns proof as an array of hex strings:
```json
{
  "proof": [
    "0x00000000000000000000000000000097e202df97fb2ec7f84fa0563a3d9c794e",
    "0x..."
  ]
}
```

Frontend concatenates into single hex string using `ethers.concat()`:
```typescript
const proofDataHex = hexlify(concat(proofData.proof));
// Result: "0x00000000000000000000000000000097e202df97fb2ec7f84fa0563a3d9c794e..."
```

This format matches what smart contracts expect for verification.

### Handle Extraction

Backend parses email content to extract platform-specific usernames:
- **X/Twitter**: `@LajosTaken` → `LajosTaken`
- **Discord**: Username from password reset email
- **GitHub**: GitHub username from notification
- **Reddit**: Reddit username from account email

Frontend uses this handle to:
1. Auto-populate the claim form
2. Resolve to ENS name: `LajosTaken.x.eth`
3. Resolve ENS to predicted ZeroDev wallet address
4. Show balance available for withdrawal

---

**Backend Status**: ✅ Deployed at `https://noir-prover.zk.email`  
**Frontend Status**: ✅ Integrated and ready to use  
**Documentation**: ✅ Complete

Happy claiming! 🎉


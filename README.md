# Aura Journal — Empathetic & Insightful AI Journaling Assistant

Aura Journal is an empathetic, insightful, and objective AI journaling companion engineered to help users process their thoughts, find clarity, and document personal growth.

---

## 🌟 Core System Behavior & Two-Part Output Pipeline

When a user submits a journal entry or reflection, the assistant processes the input and provides a structured response containing two distinct parts:

### Part 1: The Reflection (Rich Text)
1. **Validate**: Acknowledges the user's feelings and experiences without judgment.
2. **Reflect & Summarize**: Gently mirrors back the core themes of what was written to show deep understanding.
3. **Brainstorm/Expand**: Offers constructive frameworks or ideas if the user is facing a challenge or creative block.
4. **Prompt**: Always ends with a single, gentle, open-ended question to encourage further introspective writing.

### Part 2: Data Extraction (Strict JSON)
Appends a JSON object at the very end of the response inside a markdown code block containing:
- `primary_mood`: A single lowercase word representing the dominant emotion (e.g., `"stressed"`, `"grateful"`, `"peaceful"`, `"reflective"`).
- `hidden_summary`: A concise one-sentence summary of the entry for database indexing and timeline review.

```json
{
  "primary_mood": "stressed",
  "hidden_summary": "The user struggled with tight project deadlines but found some relief in a brief outdoor break."
}
```

---

## 🛡️ Agentic Threat Modeling & Security Architecture

The application implements defense-in-depth across the **5 Threat Zones**:

| Threat Zone | Identified Scenario / Risk | OWASP Vector | Countermeasure & Implementation |
| :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Malformed entries, script injection, oversized payloads | OWASP A03 / LLM02 | 10MB payload limit, defensive null-safe destructuring, top-level JSON middleware ordering. |
| **2. Planning & Reasoning** | Indirect prompt injection, instruction hijacking | OWASP LLM01 | Immutable system instruction isolation, strict parsing boundary between reflection and metadata block. |
| **3. Tool Execution** | Model timeouts, API exhaustion, rate limits | OWASP A05 / LLM04 | **Resilient Model Fallback Ladder**: `gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash` with HTTP 503/429/500 auto-retry. |
| **4. Memory & State** | Undefined property crashes, dropped transactions | OWASP A01 / A04 | Strict undefined-stripping utility before storage, dual local/server transaction verification. |
| **5. Inter-System Comm** | API key leakage to browser bundles | OWASP A02 / LLM06 | Zero-browser key exposure guarantee: all Gemini API calls occur exclusively on backend Express proxy. |

---

## 🔒 Cloud Firestore Security Rules

Deploy these rules to guarantee owner-bound user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Production Deployment to Google Cloud Run

### 1. Prerequisites
Ensure you have the Google Cloud SDK (`gcloud`) installed and configured:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Enable the necessary APIs:
```bash
gcloud services enable run.googleapis.com secretmanager.googleapis.com firestore.googleapis.com
```

### 2. Secret Management Setup
Store your Gemini API Key securely in Google Cloud Secret Manager:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run runtime service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Cloud Run
Build and deploy the application container to Google Cloud Run:

```bash
gcloud run deploy aura-journal \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### 4. Required Campaign Verification Binding
Apply the mandatory resource label to register the service for automated challenge verification:

```bash
gcloud run services update aura-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=asia-southeast1
```

---

## 🧪 Functional Verification & Walkthrough Matrix

The application includes an integrated test suite covering:
1. **Input Validation**: Empty input prevention, character sanitization, and automatic draft saving.
2. **AI Reflection Engine**: Validation, thematic mirroring, constructive frameworks, and gentle inquiry prompts.
3. **Strict Metadata Extraction**: Schema validation for `primary_mood` and `hidden_summary`.
4. **Interactive Chaining**: One-click continuation into the gentle inquiry prompt.
5. **Persistence & Undefined Stripping**: Zero-crash write hygiene and timeline synchronization.
6. **Analytics & Trends**: Real-time aggregation of emotional states, word counts, and growth milestones.

# Nyaya (न्याय) — AI-Powered Legal Aid & Case Preparation Platform for India

Nyaya is a legal case preparation, factual structuring, evidence verification, and legal aid platform tailored for India. It adheres to Indian central legislation, including the **Bharatiya Nyaya Sanhita (BNS 2023)**, **Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)**, and **Bharatiya Sakshya Adhiniyam (BSA 2023)**, as well as the transition from the **Indian Penal Code (IPC 1860)** under Article 20(1) of the Constitution of India.

---

## 🌟 Key Features

1. **Know Your Case (Step-by-Step Preparation)**:
   - Plain-English incident description with multi-domain categorization (12 categories).
   - Immediate urgency triage (112, 181, 1930, 15100).
   - Grounded statutory ingredient verification with official India Code citations.
   - Vague statement and factual gap detection.
   - Adaptive 20-question fact-clarification engine.
   - 20-Section Structured Case Report.
   - Court-ready legal drafting (Consumer Complaints, Legal Notices, Police Complaints/FIRs under BNSS 173, and Civil Plaints) with zero literal "N/A" placeholders.

2. **Manage Your Case (Document Intelligence)**:
   - Cryptographic document ingestion with SHA-256 checksums (PDF, DOCX, TXT, images).
   - Page-level text extraction and inspection.
   - Cross-document contradiction detection with interactive resolution controls.
   - Missing evidence register with legal relevance & preservation guidance.
   - Consolidated event chronology with limitation anomaly alerts.
   - Prioritized case readiness report.

3. **Statutory Legal Aid Directory**:
   - Official verified contact info for NALSA (15100), Supreme Court Legal Services Committee, Tele-Law, and SLSAs across India.
   - Section 12 Legal Services Authorities Act, 1987 eligibility guide.

4. **Law Library & Criminal Transition Checker**:
   - Central Indian statutes directory with 1 July 2024 cutoff date evaluator.

5. **DPDP Act, 2023 Privacy Compliance**:
   - Purpose limitation, data minimization, portable JSON archive export, and full audit trail.

---

## 🚀 Quick Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Type check & lint
npm run lint

# 4. Build for production
npm run build

# 5. Start development server
npm run dev
```

---

## 📦 How to Push to GitHub (`sgshetty-X`)

1. Create a new empty repository on your GitHub account:
   - Visit: [https://github.com/new](https://github.com/new)
   - Repository name: `nyaya` (or your preferred name)
   - Choose **Public** or **Private**, do not initialize with README.

2. Run the following commands in your project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nyaya AI Legal Aid Platform"
   git branch -M main
   git remote add origin https://github.com/sgshetty-X/nyaya.git
   git push -u origin main
   ```

---

## ⚡ Deployment Options

### Option A: Vercel (Recommended & Most Optimized for Frontend / SPA)
Vercel offers the fastest global CDN, edge delivery, instant builds, and automatic SSL:
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import `sgshetty-X/nyaya`.
3. Framework Preset: **Vite**.
4. Root Directory: `./`.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Click **Deploy**. The included `vercel.json` ensures all SPA routes resolve seamlessly.

### Option B: Render (Recommended for Full-Stack Node / Express)
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect `sgshetty-X/nyaya`.
4. Render will automatically detect `render.yaml` or you can configure:
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
5. Click **Create Web Service**.

---

## 📄 License
Apache-2.0

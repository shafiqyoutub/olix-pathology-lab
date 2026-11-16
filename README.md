# Raza Clinical Laboratory - Pathology Report Management System (LIS 2.0)

A modern, clinical-grade Pathology Laboratory Report Generation & Information System developed specifically for diagnostic medical laboratories.

## 🩺 System Overview

This application is strictly focused on creating, managing, previewing, downloading, and printing pathology laboratory reports with clinical precision.

### 🌟 Core Capabilities

1. **Patient Registration & Auto Age Calculation**
   - Unique auto-increment Patient ID (`PAT-YYYY-XXXXX`).
   - Patient Name, Father/Husband relationship name, Gender, Mobile, Address, Referring Doctor.
   - Automatic age calculation (Years, Months, Days) from Date of Birth.
   - Manual age entry in Years, Months, and Days when DOB is unknown.

2. **Extensive Pathology Test Library (Pre-Configured & Clinically Validated)**
   - **Hematology**: CBC (14 parameters including 5-part Differential WBC & Peripheral Blood Smear), Standalone Hb, TLC, DLC, ESR, Platelets, Blood Group & Rh Factor, Coagulation Profile (PT/INR & APTT).
   - **Biochemistry**: Fasting Blood Sugar, Random Blood Sugar, HbA1c, Complete Lipid Profile (Total Cholesterol, Triglycerides, HDL, LDL, VLDL, Ratios), Urea, Creatinine, Uric Acid, Calcium, Phosphorus, Electrolytes.
   - **Liver Function Tests (LFT)**: ALT/SGPT, AST/SGOT, Alkaline Phosphatase (ALP), Total Bilirubin, Direct Bilirubin, Indirect Bilirubin, Total Protein, Albumin, Globulin, A/G Ratio.
   - **Renal Function Tests (RFT)**: Blood Urea, Serum Creatinine, Uric Acid, BUN, Calcium, Phosphorus, Sodium, Potassium, Chloride.
   - **Serology & Immunology**: HBsAg, Anti-HCV, HIV I & II, CRP, ASO Titre, RA Factor, Widal Test (Typhi O & H), Dengue NS1 Antigen, Dengue IgG & IgM, Typhoid ICT.
   - **Endocrinology & Hormones**: Thyroid Profile (FT3, FT4, TSH), Vitamin D (25-OH), Vitamin B12, Beta HCG, LH, FSH, Prolactin, Testosterone.
   - **Clinical Pathology**: Urine Routine Examination (Physical, Chemical, Microscopic breakdown), Stool Routine Examination, Semen Analysis (WHO guidelines), Urine Pregnancy Test (UPT), Occult Blood (FOB).
   - **Custom Tests**: Laboratory administrators can create unlimited new categories and tests with customized parameters, units, input types, and ranges.

3. **Dynamic Result Entry with Automated Clinical Calculations**
   - Automatically loads all parameters when tests are selected.
   - Auto-calculates:
     - **MCH**: `(Hb * 10) / RBC` (pg)
     - **MCHC**: `(Hb * 100) / PCV` (g/dL)
     - **MCV**: `(PCV * 10) / RBC` (fL)
     - **PCV / Hematocrit**: `(RBC * MCV) / 10`
     - **LDL Cholesterol (Friedewald)**: `Total Chol - HDL - (TG / 5)` with warning if TG > 400 mg/dL.
     - **VLDL**: `TG / 5`
     - **Total Chol / HDL Ratio**
     - **Globulin**: `Total Protein - Albumin` with warning if TP < Albumin.
     - **A/G Ratio**: `Albumin / Globulin`
     - **Indirect Bilirubin**: `Total Bilirubin - Direct Bilirubin` with warning if Direct > Total.
     - **BUN**: `Urea / 2.14`
     - **INR**: `(PT_patient / PT_control) ^ ISI`
   - Real-time High / Low / Critical / Abnormal indicators with colored badges.
   - Reference ranges automatically adapt based on patient age and gender.

4. **Multi-Test Combined Reports & Individual Layouts**
   - Run single test reports or combine multiple panels into one unified document (e.g. CBC + LFT + Urine R/E).
   - Dedicated section styling for Physical, Chemical, Microscopic, and Differential counts.

5. **Report Designer & Print Studio**
   - **Page Sizes**: A4 and A5 supported.
   - **Color Modes**: Full Clinical Color or High-Contrast Monochrome Black & White (ideal for thermal or monochrome laser printers).
   - **Pre-Printed Letterhead Mode**: Toggles off laboratory header/footer so reports can be printed onto pre-printed clinic letterhead paper.
   - Font scaling and margin controls.
   - Visibility toggles for Logo, Stamp, Signature, QR code, Methodology, Units, and Flags.

6. **Safety & Audit Trail**
   - Finalized reports cannot be silently overwritten. Reissuing requires doctor authorization notes and creates version history (`v1`, `v2`, `v3`).
   - Immutable audit log tracking all patient registrations, report sign-offs, and parameter updates.
   - One-click full database export and restore.

## 🚀 Running the System

- **Backend Express API & Production Server**: `http://localhost:5001`
- **Frontend Vite Development Server**: `http://localhost:5173`

Both servers run concurrently via:
```bash
npm run dev
```

Or build and serve standalone:
```bash
npm run build
npm run server
```

## 🏥 Default Clinic Profile
- **Laboratory Name**: Raza Clinical Laboratory
- **Doctor Name**: Dr. Ghulam Muhammad
- **Qualifications**: M.B.B.S., M.Phil. (Pathology), Consultant Pathologist
- **Registration**: PMDC Reg. # 45291-P
- **Address**: Main Bazar Dera Bakha, Bahawalpur, Punjab
- **Phone**: 03458776130

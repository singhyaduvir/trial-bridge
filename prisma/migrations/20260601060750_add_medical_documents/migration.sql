-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demographics" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "sexAtBirth" TEXT NOT NULL,
    "pregnant" TEXT NOT NULL,
    "breastfeeding" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Demographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "confirmationMethod" TEXT NOT NULL,
    "diseaseSubtype" TEXT,
    "timeSinceDiagnosis" TEXT,
    "severityScore" TEXT,
    "biomarkerStatus" TEXT,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "comorbidities" TEXT,
    "relatedDiseases" TEXT,
    "surgicalHistory" TEXT,
    "allergies" TEXT,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "previousTherapies" TEXT,
    "washoutCompleted" TEXT,
    "diseaseStatus" TEXT,
    "currentMedications" TEXT,
    "otherTrials" TEXT,

    CONSTRAINT "Treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "hemoglobin" DOUBLE PRECISION,
    "anc" INTEGER,
    "platelets" INTEGER,
    "ast" INTEGER,
    "alt" INTEGER,
    "bilirubin" DOUBLE PRECISION,
    "creatinine" DOUBLE PRECISION,
    "egfr" INTEGER,
    "diseaseSpecific" TEXT,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunctionalStatus" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "ecogScore" TEXT,
    "dailyActivities" TEXT,
    "cognitiveCapacity" TEXT,

    CONSTRAINT "FunctionalStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneticCriteria" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "geneticTesting" TEXT,
    "mutations" TEXT,
    "mutationType" TEXT,
    "diagnosticTest" TEXT,

    CONSTRAINT "GeneticCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReproductiveHealth" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fertilityStatus" TEXT,
    "contraception" TEXT,
    "pregnancyTest" TEXT,
    "pregnancyTestDate" TIMESTAMP(3),

    CONSTRAINT "ReproductiveHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyConstraints" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "lvef" INTEGER,
    "infections" TEXT,
    "qtInterval" INTEGER,
    "adverseReactions" TEXT,

    CONSTRAINT "SafetyConstraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrative" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "informedConsent" TEXT NOT NULL,
    "complianceWillingness" TEXT NOT NULL,
    "insuranceStatus" TEXT,
    "languageComprehension" TEXT,

    CONSTRAINT "Administrative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "typeId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Demographics_patientId_key" ON "Demographics"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_patientId_key" ON "Diagnosis"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalHistory_patientId_key" ON "MedicalHistory"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Treatments_patientId_key" ON "Treatments"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_patientId_key" ON "Laboratory"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "FunctionalStatus_patientId_key" ON "FunctionalStatus"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneticCriteria_patientId_key" ON "GeneticCriteria"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "ReproductiveHealth_patientId_key" ON "ReproductiveHealth"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyConstraints_patientId_key" ON "SafetyConstraints"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "Administrative_patientId_key" ON "Administrative"("patientId");

-- AddForeignKey
ALTER TABLE "Demographics" ADD CONSTRAINT "Demographics_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatments" ADD CONSTRAINT "Treatments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laboratory" ADD CONSTRAINT "Laboratory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionalStatus" ADD CONSTRAINT "FunctionalStatus_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneticCriteria" ADD CONSTRAINT "GeneticCriteria_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReproductiveHealth" ADD CONSTRAINT "ReproductiveHealth_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyConstraints" ADD CONSTRAINT "SafetyConstraints_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Administrative" ADD CONSTRAINT "Administrative_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalDocument" ADD CONSTRAINT "MedicalDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

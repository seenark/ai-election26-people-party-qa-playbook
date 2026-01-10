/*
  Warnings:

  - Changed the type of `status` on the `policies` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('youtube', 'facebook_post', 'manual');

-- CreateEnum
CREATE TYPE "QAStatus" AS ENUM ('approved', 'draft', 'rejected');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('approved', 'draft', 'deprecated');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('active', 'archived');

-- CreateEnum
CREATE TYPE "CanonicalStatus" AS ENUM ('approved', 'deprecated');

-- CreateEnum
CREATE TYPE "InfographicStatus" AS ENUM ('pending', 'completed', 'failed');

-- AlterTable
ALTER TABLE "policies" DROP COLUMN "status",
ADD COLUMN     "status" "PolicyStatus" NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "sources" (
    "id" UUID NOT NULL,
    "type" "SourceType" NOT NULL,
    "url" TEXT,
    "raw_text" TEXT,
    "transcript" TEXT,
    "speaker" TEXT NOT NULL,
    "date" DATE,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_pairs" (
    "id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "question_text" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "ts_start_seconds" INTEGER,
    "ts_end_seconds" INTEGER,
    "topic_category" TEXT,
    "region" TEXT,
    "status" "QAStatus" NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "qa_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_policy_links" (
    "qa_id" UUID NOT NULL,
    "policy_id" UUID NOT NULL,
    "relevance_score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "qa_policy_links_pkey" PRIMARY KEY ("qa_id","policy_id")
);

-- CreateTable
CREATE TABLE "question_clusters" (
    "id" UUID NOT NULL,
    "canonical_question" TEXT NOT NULL,
    "topic_category" TEXT,
    "region" TEXT,
    "status" "ClusterStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "question_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_cluster_links" (
    "qa_id" UUID NOT NULL,
    "cluster_id" UUID NOT NULL,
    "similarity_score" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "qa_cluster_links_pkey" PRIMARY KEY ("qa_id","cluster_id")
);

-- CreateTable
CREATE TABLE "canonical_answers" (
    "id" UUID NOT NULL,
    "cluster_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "short_answer" TEXT NOT NULL,
    "long_answer" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "how" TEXT NOT NULL,
    "bullet_points" TEXT[],
    "red_lines" TEXT[],
    "change_summary" TEXT,
    "status" "CanonicalStatus" NOT NULL DEFAULT 'approved',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMPTZ(3),

    CONSTRAINT "canonical_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "infographics" (
    "id" UUID NOT NULL,
    "canonical_id" UUID NOT NULL,
    "image_url" TEXT,
    "prompt" TEXT,
    "status" "InfographicStatus" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "infographics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sources_url_key" ON "sources"("url");

-- CreateIndex
CREATE INDEX "qa_pairs_source_id_idx" ON "qa_pairs"("source_id");

-- CreateIndex
CREATE INDEX "qa_pairs_status_idx" ON "qa_pairs"("status");

-- CreateIndex
CREATE INDEX "qa_pairs_topic_category_idx" ON "qa_pairs"("topic_category");

-- CreateIndex
CREATE INDEX "qa_pairs_region_idx" ON "qa_pairs"("region");

-- CreateIndex
CREATE INDEX "qa_policy_links_policy_id_idx" ON "qa_policy_links"("policy_id");

-- CreateIndex
CREATE INDEX "question_clusters_status_idx" ON "question_clusters"("status");

-- CreateIndex
CREATE INDEX "question_clusters_topic_category_idx" ON "question_clusters"("topic_category");

-- CreateIndex
CREATE INDEX "question_clusters_region_idx" ON "question_clusters"("region");

-- CreateIndex
CREATE INDEX "qa_cluster_links_cluster_id_idx" ON "qa_cluster_links"("cluster_id");

-- CreateIndex
CREATE INDEX "canonical_answers_cluster_id_idx" ON "canonical_answers"("cluster_id");

-- CreateIndex
CREATE INDEX "canonical_answers_status_idx" ON "canonical_answers"("status");

-- CreateIndex
CREATE INDEX "canonical_answers_version_idx" ON "canonical_answers"("version");

-- CreateIndex
CREATE INDEX "infographics_canonical_id_idx" ON "infographics"("canonical_id");

-- CreateIndex
CREATE INDEX "infographics_status_idx" ON "infographics"("status");

-- CreateIndex
CREATE INDEX "policies_slug_idx" ON "policies"("slug");

-- CreateIndex
CREATE INDEX "policies_status_idx" ON "policies"("status");

-- CreateIndex
CREATE INDEX "policies_category_idx" ON "policies"("category");

-- CreateIndex
CREATE INDEX "policies_level_idx" ON "policies"("level");

-- AddForeignKey
ALTER TABLE "qa_pairs" ADD CONSTRAINT "qa_pairs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_policy_links" ADD CONSTRAINT "qa_policy_links_qa_id_fkey" FOREIGN KEY ("qa_id") REFERENCES "qa_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_policy_links" ADD CONSTRAINT "qa_policy_links_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_cluster_links" ADD CONSTRAINT "qa_cluster_links_qa_id_fkey" FOREIGN KEY ("qa_id") REFERENCES "qa_pairs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_cluster_links" ADD CONSTRAINT "qa_cluster_links_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "question_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canonical_answers" ADD CONSTRAINT "canonical_answers_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "question_clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "infographics" ADD CONSTRAINT "infographics_canonical_id_fkey" FOREIGN KEY ("canonical_id") REFERENCES "canonical_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

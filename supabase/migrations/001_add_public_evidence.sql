-- Migration: Add evidence support to public_reports
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/qylnfhdcpjokcmgiybme/sql

-- 1. Add evidence_url column to public_reports table
ALTER TABLE public.public_reports
  ADD COLUMN IF NOT EXISTS evidence_url text;

-- 2. Allow anonymous users to upload evidence files under the public-reports/ folder
CREATE POLICY "Anon can upload public report evidence"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND (storage.foldername(name))[1] = 'public-reports'
  );

-- 3. Allow anyone to read public report evidence (so thumbnails render)
CREATE POLICY "Anyone can view public report evidence"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'evidence'
    AND (storage.foldername(name))[1] = 'public-reports'
  );

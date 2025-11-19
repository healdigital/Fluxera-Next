-- Add image_url field to assets table for storing asset images
-- This migration adds support for image uploads in the asset management system

-- Add image_url column to assets table
ALTER TABLE public.assets 
ADD COLUMN image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.assets.image_url IS 'URL of the asset image stored in Supabase Storage';

-- Create index for faster queries when filtering by images
CREATE INDEX idx_assets_image_url ON public.assets(image_url) WHERE image_url IS NOT NULL;

CREATE TABLE public.commission_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  discord text,
  project_type text NOT NULL,
  build_scale text,
  budget_range text,
  deadline text,
  description text NOT NULL
);

GRANT INSERT ON public.commission_inquiries TO anon;
GRANT INSERT, SELECT ON public.commission_inquiries TO authenticated;
GRANT ALL ON public.commission_inquiries TO service_role;

ALTER TABLE public.commission_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a commission inquiry"
ON public.commission_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(email) BETWEEN 3 AND 255
  AND length(description) BETWEEN 1 AND 5000
  AND length(coalesce(discord, '')) <= 120
  AND length(project_type) BETWEEN 1 AND 80
);
# ILLEGAL CAFFEINE contact storage setup

This build uses a private Supabase Storage bucket for reference images so large image files do not pass through the Vercel Function request body.

## Required Supabase project

- Project ID: `hezwtxovkdcnewgkrvtl`
- Project URL: `https://hezwtxovkdcnewgkrvtl.supabase.co`

## Required private Storage bucket

Bucket name: `inquiry-references`

Settings:

- Public bucket: OFF
- Restrict file size: ON
- Per-file limit: 10 MB
- Restrict MIME types: ON
- Allowed MIME types: `image/jpeg, image/png, image/webp`

No anonymous Storage policy is required. The browser uploads only through short-lived signed upload tokens created by the server using `SUPABASE_SECRET_KEY`.

## Contact upload limits in this build

- Maximum 5 images
- Maximum 10 MB per image
- Maximum 25 MB total

## Required Vercel Production environment variables

Server-only secrets:

- `RESEND_API_KEY`
- `SUPABASE_SECRET_KEY`

Public/build-time Supabase configuration:

- `SUPABASE_URL=https://hezwtxovkdcnewgkrvtl.supabase.co`
- `VITE_SUPABASE_URL=https://hezwtxovkdcnewgkrvtl.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<new sb_publishable_... key>`

For local development, replace `PASTE_NEW_SB_PUBLISHABLE_KEY_HERE` in `.env` in both publishable-key lines with the new project's Publishable key.

## Submission flow

1. The browser asks the Vercel server for signed upload tokens.
2. The browser uploads reference images directly to the private `inquiry-references` bucket.
3. The inquiry row is inserted into `commission_inquiries`, including `agreement=true`.
4. The server verifies the uploaded object metadata and creates short-lived signed download URLs.
5. Resend fetches those URLs and sends the files as real email attachments to `illegalcaffeine@gmail.com`.
6. After Resend confirms success, the temporary Storage objects are deleted.
7. If email delivery fails after the inquiry is saved, the uploaded files are intentionally left in Storage for recovery rather than asking the visitor to submit again.

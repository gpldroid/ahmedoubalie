# EmDash on Netlify

This project uses EmDash inside the existing Astro application. The admin panel is served at:

`https://ahmedoubali.netlify.app/_emdash/admin`

## Runtime architecture

- Astro server output and the official Netlify adapter handle the public site, EmDash admin UI, and API routes.
- PostgreSQL stores EmDash content, users, and settings. Set `DATABASE_URL` to a persistent PostgreSQL connection string.
- S3-compatible object storage stores uploaded media. Cloudflare R2 is one option; configure the `S3_*` variables below.
- Local development uses SQLite (`data.db`) and the local `uploads/` directory.
- Astro's Netlify adapter supplies persistent session storage through Netlify Blobs.

Do not use SQLite or local media storage for production on Netlify Functions: function filesystems are not persistent across invocations or deployments.

## Required Netlify environment variables

Add these in **Site configuration → Environment variables**. Apply them to Production and Deploy Previews where needed.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `EMDASH_ENCRYPTION_KEY` | EmDash encryption key |
| `S3_ENDPOINT` | S3-compatible endpoint |
| `S3_BUCKET` | Media bucket name |
| `S3_ACCESS_KEY_ID` | Media storage access key |
| `S3_SECRET_ACCESS_KEY` | Media storage secret |
| `S3_REGION` | Optional; defaults to `auto` |

The build intentionally stops on Netlify if the database, media storage, or encryption key is missing. This prevents a deployment that appears to work but cannot persist content or media.

Generate the encryption key locally:

```bash
npx emdash secrets generate --write .env
```

Copy only the generated `EMDASH_ENCRYPTION_KEY` value into Netlify as a secret. Keep `.env` out of Git.

## GitHub sign-in (optional)

The built-in passkey login remains available. To also enable GitHub sign-in, add these Netlify environment variables:

- `EMDASH_OAUTH_GITHUB_CLIENT_ID`
- `EMDASH_OAUTH_GITHUB_CLIENT_SECRET`

Set the GitHub OAuth App callback URL to:

```
https://ahmedoubali.netlify.app/_emdash/api/auth/oauth/github/callback
```

The OAuth provider is enabled only when both values are present. Never commit the client secret.

## First admin setup

After the required production environment variables are configured and the site has deployed:

1. Open `/_emdash/admin`.
2. Complete the EmDash setup wizard.
3. Create the first administrator account and register a passkey (or use GitHub sign-in if configured).
4. Confirm that the Posts and Pages collections appear in the dashboard.

## Important account note

The current Netlify team is on the Free plan. Netlify Database is limited to credit-based plans, so this integration uses a separate managed PostgreSQL database through `DATABASE_URL` rather than assuming Netlify Database is available.

## References

- [EmDash: add to an existing Astro project](https://docs.emdashcms.com/existing-project/)
- [EmDash: database options](https://docs.emdashcms.com/deployment/database/)
- [EmDash: media storage options](https://docs.emdashcms.com/deployment/storage/)
- [EmDash: authentication](https://docs.emdashcms.com/guides/authentication/)
- [Astro: Netlify adapter](https://docs.astro.build/en/guides/integrations-guide/netlify/)

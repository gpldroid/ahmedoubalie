import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import emdash, { local, s3 } from "emdash/astro";
import { postgres, sqlite } from "emdash/db";
import { github } from "emdash/auth/providers/github";

const isNetlify = process.env.NETLIFY === "true";
const databaseUrl = process.env.DATABASE_URL;

if (isNetlify && !databaseUrl) {
  throw new Error(
    "EmDash requires a persistent PostgreSQL database on Netlify. Set DATABASE_URL before deploying.",
  );
}

if (
  isNetlify &&
  (!process.env.S3_ENDPOINT ||
    !process.env.S3_BUCKET ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY)
) {
  throw new Error(
    "EmDash media storage is not configured. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY before deploying.",
  );
}

if (isNetlify && !process.env.EMDASH_ENCRYPTION_KEY) {
  throw new Error(
    "Set EMDASH_ENCRYPTION_KEY in Netlify environment variables before deploying.",
  );
}

const database = databaseUrl
  ? postgres({ connectionString: databaseUrl })
  : sqlite({ url: "file:./data.db" });

const storage = isNetlify
  ? s3()
  : local({
      directory: "./uploads",
      baseUrl: "/_emdash/api/media/file",
    });

const githubOAuthConfigured =
  Boolean(process.env.EMDASH_OAUTH_GITHUB_CLIENT_ID) &&
  Boolean(process.env.EMDASH_OAUTH_GITHUB_CLIENT_SECRET);

export default defineConfig({
  site: "https://ahmedoubali.netlify.app",
  base: "/",
  output: "server",
  adapter: netlify(),
  integrations: [
    react(),
    emdash({
      database,
      storage,
      siteUrl: "https://ahmedoubali.netlify.app",
      fonts: { scripts: ["arabic"] },
      ...(githubOAuthConfigured ? { authProviders: [github()] } : {}),
    }),
  ],
});

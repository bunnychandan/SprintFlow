Google OAuth & NextAuth Setup

1) Create OAuth client in Google Cloud Console
- Go to https://console.cloud.google.com/apis/credentials
- Create Credentials → OAuth client ID → Web application
- Add these Redirect URIs:
  - http://localhost:3000/api/auth/callback/google
  - (Add your production URL equivalent)
- Save and copy `Client ID` and `Client secret`.

2) Populate environment variables
- Copy `.env.example` to `.env` and fill in:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_URL` (must match app origin)
  - `NEXTAUTH_SECRET` (a long random string)
  - `DATABASE_URL` (Postgres)
  - `ADMIN_EMAIL` (email address to be granted admin role)

3) Common cause of 401 invalid_client
- The `invalid_client` error means Google doesn't recognize the client id/secret or the redirect URI.
- Verify the `Client ID`/`Client secret` are correct and that the redirect URI above is listed exactly (including protocol and port) in the Google Cloud Console.

4) Run migrations & start
- Run `npx prisma migrate dev` (or `npx prisma migrate deploy` for production)
- Run `npx prisma generate`
- Restart the Next.js dev server so environment variables are reloaded

5) Admin account behavior
- Set `ADMIN_EMAIL` in `.env` to the single email that should receive the `ADMIN` role.
- If a different ADMIN exists, sign-in will be denied for additional ADMIN emails (enforces single admin).

6) Production notes
- Use `https://...` in `NEXTAUTH_URL` for production and register corresponding redirect URIs in Google Cloud Console.
- Keep `NEXTAUTH_SECRET` and Google client secret secure and never commit `.env` to source control.

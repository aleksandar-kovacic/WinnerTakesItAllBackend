# WinnerTakesItAll Frontend

## Main Pages

- `/` - Home page: Main dashboard and navigation.
- `/login` - Login form for existing users.
- `/register` - Registration form for new users.
- `/ban` - View and toggle your ban status.
- `/verify` - Upload images for identity verification.

## Getting Started

Install dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js (App Router, API routes)
- **Language**: TypeScript
- **UI**: Material UI (MUI), Tailwind CSS
- **State Management**: React hooks
- **HTTP**: Axios

## Project Structure

- pages - Main app pages and API routes
- styles - Global and module CSS (Tailwind)
- public - Static assets
- `components/` - (Add your shared React components here)

## Customization

- Update theme and colors in tailwind.config.ts and MUI theme objects.
- Add or modify API endpoints in api as needed.
# Afterhours AI Marketing Website

Production-ready marketing website for Afterhours AI built with Next.js, TypeScript, TailwindCSS, and shadcn/ui.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + **shadcn/ui** components
- **Zod** (validation)
- **Nodemailer** (email)
- **Airtable** (optional lead storage)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

**Required for email:**
- `SMTP_HOST` - Your SMTP server (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` - Your email address
- `SMTP_PASS` - Your email password or app password
- `LEADS_TO_EMAIL` - Where to send lead notifications

**Optional for Airtable:**
- `AIRTABLE_ACCESS_TOKEN` - Your Airtable Personal Access Token
- `AIRTABLE_BASE_ID` - Your Airtable base ID
- `AIRTABLE_LEADS_TABLE` - Table name (defaults to "Leads")

**Note:** If SMTP is not configured, leads will be logged to console only. If Airtable is not configured, leads will skip Airtable storage gracefully.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when prompted.

## Environment Variables Setup

### SMTP Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASS=your-app-password`

For other providers (SendGrid, AWS SES, etc.), use their SMTP settings.

### Airtable Setup (Optional)

1. Get your Personal Access Token from [Airtable](https://airtable.com/create/tokens)
2. Create a base or use an existing one
3. Create a "Leads" table with these fields:
   - Name (Single line text)
   - Email (Email)
   - Phone (Phone number)
   - Trade (Single select)
   - City (Single line text)
   - State (Single line text)
   - Call Volume (Single line text)
   - Current Handling (Long text)
   - Submitted At (Date)

## Project Structure

```
website/
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts          # Lead submission API
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── how-it-works/
│   │   └── page.tsx              # How it works page
│   ├── pricing/
│   │   └── page.tsx              # Pricing page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── lib/
│   └── utils.ts                  # Utility functions
└── components.json                # shadcn/ui config
```

## Features

- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **SEO Optimized** - Metadata, OpenGraph, sitemap, robots.txt
- ✅ **Form Validation** - Zod schema validation
- ✅ **Email Notifications** - Nodemailer integration
- ✅ **Airtable Integration** - Optional lead storage
- ✅ **Dark/Navy Theme** - Modern B2B aesthetic
- ✅ **Type-Safe** - Full TypeScript support

## Pages

1. **Home** (`/`) - Hero, features, FAQ, CTA
2. **How It Works** (`/how-it-works`) - Flow diagram, ACK explanation, retry timelines
3. **Pricing** (`/pricing`) - 3 tiers with feature lists
4. **Start Trial** (`/start`) - Trial intake form

## API Endpoints

### POST `/api/lead`

Submits a trial intake request.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+15551234567",
  "trade": "Plumbing",
  "city": "San Francisco",
  "state": "CA",
  "callVolume": "11-20",
  "currentHandling": "We use voicemail currently"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! We'll be in touch soon."
}
```

**Error Response:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Customization

### Colors

Edit `app/globals.css` to change the color scheme. The theme uses CSS variables for easy customization.

### Content

All copy is in the page components:
- `app/page.tsx` - Homepage content
- `app/how-it-works/page.tsx` - How it works content
- `app/pricing/page.tsx` - Pricing content

### Components

UI components are in `components/ui/` (shadcn/ui). Add more components using:

```bash
npx shadcn-ui@latest add [component-name]
```

## Troubleshooting

### "SMTP not configured" in logs

This is normal if you haven't set up SMTP. Leads will still be logged to console. To enable email, configure SMTP variables in `.env`.

### "Airtable not configured" in logs

This is normal if you haven't set up Airtable. Leads will still be sent via email (if configured). To enable Airtable, add the required variables.

### Build errors

Make sure all dependencies are installed:
```bash
npm install
```

Check TypeScript errors:
```bash
npm run build
```

## Support

For questions or issues:
- Email: hello@afterhoursai.com
- Phone: (555) 123-4567

## License

ISC

# A Beautiful Beginning: Vishal & Krishi's Wedding Website

This project is a wedding invitation website. It includes the couple's story,
ceremony details, directions, a countdown, music, calendar downloads, and
downloadable invitation cards. There are groom and bride versions, English and
Gujarati text, and light and dark themes.

**You do not need coding experience to run the existing website.** Follow the
setup steps below in order. Changing its design or wording involves editing
files, but you can leave everything as it is.

## Find Your Next Step

- [First-time setup](#first-time-setup): install the tools and open the website.
- [Start it again later](#start-it-again-later): what to do after the first setup.
- [Choose an invitation version](#choose-an-invitation-version): groom, bride, or Gujarati.
- [Personalised guest invitations](#personalised-guest-invitations-optional): optional database and admin setup.
- [Change the wedding details](#change-the-wedding-details): names, dates, text, and images.
- [Publish the website](#publish-the-website): make it accessible to guests online.
- [Troubleshooting](#troubleshooting): help with common problems.
- [Technical reference](#technical-reference): commands and notes for developers.

## Before You Begin

You will need:

- A Mac, Windows, or Linux computer.
- An internet connection to download the tools and project dependencies.
- A browser such as Chrome, Safari, Firefox, or Edge.
- The project folder, containing this README and a file called `package.json`.

There are two ways to set up the website, plus an optional publishing step:

| What you want                                         | What you need                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Open the standard wedding invitation on your computer | Complete first-time setup only. No database or Supabase account needed. |
| Create guest-specific links with names and messages   | Complete first-time setup, then the optional Supabase setup.            |
| Send a working website link to other people           | Publish the website. A local link works only on your own computer.      |

**A few words used in this guide:**

- **Terminal:** a window where you type instructions for your computer.
- **Command:** one of those instructions. Paste it into the terminal and press Enter.
- **Dependencies:** the supporting software this website needs.
- **Local:** running on your computer, not published on the internet.
- **Server:** the running program that lets your browser open the website.
- **Deployment:** publishing the website online.

Copy only the text inside a command box. Do not type the surrounding backticks,
and run each command separately unless a step says otherwise.

## First-Time Setup

### Step 1: Install a File Editor

Use [Visual Studio Code](https://code.visualstudio.com/) (VS Code), a free app
for opening project folders and editing files. Download it for your operating
system and follow its installation instructions.

If you already use an editor such as Trae, you can use that instead. The menu
names below refer to VS Code.

### Step 2: Install Node.js

1. Open [nodejs.org](https://nodejs.org/).
2. Choose the current **LTS** release. LTS means the stable, long-term-supported version.
3. Follow the installation instructions for your computer. Keep the default options.
4. Close and reopen your editor after installation so it can find the new software.

Node.js is required because this project's build command uses it, even when
you use Bun to install and start the project.

### Step 3: Open the Project and Its Terminal

If you already have the folder, do not download another copy.

If you are getting it from GitHub, open the project's repository, select
**Code > Download ZIP**, and extract the ZIP first. Work in the extracted
folder, not inside the ZIP. Its name may be `wedding-web` or `wedding-web-main`.

1. In VS Code, choose **File > Open Folder**.
2. Select the project folder. On this Mac it is `/Users/vishaltailor/Desktop/Projects/wedding-web`.
3. Check that `README.md`, `package.json`, and `src` appear in the file list.
4. Choose **Terminal > New Terminal**. A terminal opens at the bottom of the editor.
5. Check Node.js by running:

```bash
node --version
```

You should see a version number starting with `v`, not an error.

The editor's terminal normally opens in the selected project folder. If a
later command says it cannot find `package.json`, close that terminal, check
that you opened the correct folder, and choose **Terminal > New Terminal** again.

### Step 4: Install Bun

Bun installs the dependencies and runs the project's commands. This guide uses
Bun because the project includes a Bun lockfile, which records dependency versions.

Open [Bun's installation guide](https://bun.sh/docs/installation). Use the
instructions for your operating system. The standard installer commands are:

**Mac or Linux terminal:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows PowerShell:**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

These commands download and run Bun's official installer. Use them only from
the official source; on a managed work computer, check with your IT team first.

After installation, close and reopen the editor, open a new terminal, and run:

```bash
bun --version
```

You should see a version number. If you see "command not found" or "not
recognized", follow the troubleshooting section before continuing.

### Step 5: Install the Website's Dependencies

In the project terminal, run:

```bash
bun install
```

Wait until it finishes and the terminal is ready for another command. It
downloads dependencies into a folder called `node_modules`. The first install
may take a few minutes, depending on your connection.

You usually do this once, and again when the project's dependencies change.

### Step 6: Start the Website

Run:

```bash
bun run dev
```

The terminal should show a **Local** address, usually:

```text
http://localhost:5173/
```

Open the exact address shown in your browser. If another program already uses
that port, the address might be `http://localhost:5174/` or another number.

**Keep the terminal open.** While the server is running, the terminal is busy;
this is normal. The website stops when you stop that command or close the terminal.

Do not double-click `index.html` to open the site. This project needs the server
started by `bun run dev`.

### Step 7: Check That It Works

You should see Vishal and Krishi's wedding invitation. Scroll down and check
that the story, events, and venue appear.

Try the bride and Gujarati links in the next section. If you did not configure
Supabase, the standard invitation should still work; the admin page will not
be ready yet.

**To stop the website:** click inside the terminal and press **Ctrl+C**.
Use the Control key, including on a Mac.

## Start It Again Later

1. Open the same project folder in your editor.
2. Choose **Terminal > New Terminal**.
3. Run `bun run dev`.
4. Open the Local address printed in the terminal.

You do not need to reinstall Node.js or Bun every time. You do not need to run
`bun install` again unless dependencies changed or `node_modules` is missing.

## Choose an Invitation Version

These examples assume the server uses port `5173`. If your terminal shows a
different port, replace `5173` with that number.

| Browser address                             | What you will see                              |
| ------------------------------------------- | ---------------------------------------------- |
| `http://localhost:5173/`                    | English invitation, groom's side               |
| `http://localhost:5173/?side=groom`         | Vishal Weds Krishi, groom's side               |
| `http://localhost:5173/?side=bride`         | Krishi Weds Vishal, bride's side               |
| `http://localhost:5173/?lang=gu`            | Gujarati invitation, groom's side              |
| `http://localhost:5173/?side=bride&lang=gu` | Gujarati invitation, bride's side              |
| `http://localhost:5173/admin`               | Admin page, requiring the optional setup below |

The text after `?` selects the version without changing any files. Missing or
invalid side values use the groom version. Missing or unsupported language
values use English. The URL determines the language, not the browser's language.

After publishing, replace `http://localhost:5173` with your public website address.

## Personalised Guest Invitations (Optional)

**Skip this section if you only want the standard invitation.**

Supabase is an online service that stores guest names and messages and handles
admin sign-in. This setup connects the website to your own Supabase project.
You do not need to install a database on your computer.

### Step 1: Create a Supabase Project

1. Visit [supabase.com](https://supabase.com/) and sign in or create an account.
2. Create a new project in your organisation.
3. Choose a project name, database password, and region.
4. Store the database password safely and wait for the project to finish setting up.

The database password is not your website admin password. You will create the
website admin account separately.

### Step 2: Create the Database Tables and Access Rules

This step uses SQL, a language for giving instructions to a database. You can
use the supplied file without writing the database setup yourself.

1. In your editor, open `supabase/migrations/personalized_invitations.sql`.
2. Copy the entire contents of that file.
3. In your Supabase project dashboard, open **SQL Editor** and create a new query.
4. Paste the contents and select **Run**.
5. Confirm that the query completes without an error.

Run this in your intended Supabase project, not an unrelated database. Keep
the supplied access rules: they prevent visitors from browsing the guest list.

### Step 3: Create Your Admin Account

1. In Supabase, open **Authentication > Users**.
2. Use **Add user > Create new user** (the wording may vary).
3. Enter your email address in lowercase and choose a strong password.
4. Mark the email as confirmed, using the auto-confirm option if available.
5. Save the account and store its password safely.

Next, allow that account to manage invitations. Open a new query in **SQL Editor**
and run the following, replacing `you@example.com` with the same lowercase email:

```sql
insert into private.invitation_admins (email)
values ('you@example.com')
on conflict (email) do nothing;
```

Do not remove the single quotes around the email.

The file `supabase/migrations/invitation_admins.sql` contains the original
owner's email. Do not run it unchanged when setting up your own admin account;
use the example above instead.

### Step 4: Connect the Website to Supabase

1. Find your **Project URL** in Supabase's **Connect** panel or project settings.
2. Find your **publishable key** or legacy **anon/public key** in the API keys settings.
3. In your editor's file list, create a file named `.env.local` next to `package.json`.
4. If `.env.local` already exists, update it instead of creating a second file.
5. Paste the following and replace both example values with your project's values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

The name must be exactly `.env.local`, including the initial dot, not
`.env.local.txt`. Use one setting per line. These are connection settings,
not commands to run in the terminal.

**Never use a `service_role` key or a secret key here.** The website's public
key is meant for browser use; the database access rules restrict what it can do.
Do not put your database password or admin password in this file.

`.env.example` shows the available setting names. Do not copy its placeholder
values unchanged: they are not a working Supabase connection. For local use,
leave `SITE_URL` out; it is used when publishing.

Save the file. Stop the server with **Ctrl+C** and run `bun run dev` again.
Connection settings are read when the server starts.

### Step 5: Create and Test a Guest Invitation

1. Open `http://localhost:5173/admin`, using your actual port if different.
2. Sign in with the email and password from Step 3.
3. Create an invitation with a guest name, the groom or bride version, and an optional message.
4. Copy the generated guest link.
5. Open it in a private/incognito browser window and check the greeting.

A personal link looks like `/?side=groom&invite=...`. The long `invite` value
is generated automatically; do not invent one or replace it with a guest name.

For a Gujarati personal invitation, append `&lang=gu` to the generated link.
Guest names and messages appear exactly as entered, so enter them in Gujarati
if you want a Gujarati greeting. The admin page stays in English and song lyrics
stay in their original Hindi.

**Local guest links are for testing only.** After publishing, open the admin
page on the public website and copy links there so guests receive public URLs.

### Manage Invitations and Passwords

- Edit a guest's name or message in `/admin`; they see the change on their next page refresh.
- Pause or delete an invitation to make its link return to the standard invitation.
- Changing the side in a personal link also removes the personal greeting.
- Use **Change password** in the admin header; it asks for the current password.
- If you lose the password, set a new one through **Supabase > Authentication > Users**. This project has no email-based password reset screen.

Treat personal links as private. Anyone with a link can view that guest's name
and message, including a messaging service that fetches the link preview.
Revoking a link cannot remove previews or copies already saved by another service.

## Change the Wedding Details

You can run the site without making changes. If you do edit it, keep a backup
of the original file and make one small change at a time.

Open a file in your editor, change the relevant text, and save with **Ctrl+S**
on Windows/Linux or **Command+S** on Mac. While `bun run dev` is running, the
browser usually updates automatically.

| What to change                                                          | File or folder           |
| ----------------------------------------------------------------------- | ------------------------ |
| Names, wedding dates, venue, map link, home addresses, ceremony details | `src/wedding.js`         |
| Gujarati translations                                                   | `src/translations-gu.js` |
| Our Story and other page wording                                        | `src/routes/index.jsx`   |
| Colours, fonts, spacing, and layout                                     | `src/index.css`          |
| Hero, story, and venue artwork                                          | `src/assets/images/`     |
| Music and lyric files                                                   | `src/assets/song/`       |

In `src/wedding.js`, `sharedWedding` holds common details and `weddingSides`
holds the groom and bride details. Update both sides where needed.

For example, to change the venue, replace only the text inside the quotes:

```js
venue: "SMC Community Hall",
```

Keep the quotes, commas, and brackets in place. Avoid adding an unescaped double
quote inside double-quoted text, as that can break the file.

**Dates need extra care.** The `date` and `endDate` values control the countdown
and calendar entry. A value such as `2026-12-12T16:00:00+05:30` means
12 December 2026 at 4:00 PM in India's time zone. `dateLabel` and each ceremony's
`date` and `time` are separate display text; changing one does not automatically
update the others. Check that they all match your intended schedule.

`content.md` is a story draft, not the text source loaded by the website.
Editing that file alone will not change the displayed story. New English wording
also needs corresponding Gujarati translations.

Artwork and music changes may require updating imports in the page or component
files. Ask someone familiar with the code to help with those changes. After
editing, check both sides, both languages, and light and dark themes.

## Publish the Website

Running `bun run dev` does not make the website public. For guests to open it,
you need a hosting service. This project includes configuration for **Vercel**,
including personalised link previews.

Hosting providers can change their pricing and limits. Review the selected plan
before publishing; a custom domain may cost extra.

### Step 1: Check the Publishing Build Locally

Stop the development server with **Ctrl+C**, then run:

```bash
bun run build
```

This creates a `dist` folder containing the publishing-ready website. Wait for
the build to finish without errors, then run:

```bash
bun run preview
```

Open the address shown in the terminal, usually `http://localhost:4173/`.
Check the invitation again. This is still a local preview, not a public website.
Press **Ctrl+C** when finished.

### Step 2: Put the Project in a GitHub Repository

Vercel can publish from GitHub and update the site when you upload changes.

If the project is already in a GitHub repository you can access, use that
repository. Otherwise, create a repository on [github.com](https://github.com/)
and use [GitHub Desktop](https://desktop.github.com/) to add the existing project
folder and publish it. A private repository is a good choice for a family project.

Before publishing the repository, inspect the files being uploaded. The included
`.gitignore` excludes `.env.local`, `.env`, `node_modules`, and `dist`.
Do not upload passwords, secret keys, or private guest exports. Keep `bun.lockb`,
the source files, `api`, `scripts/fonts`, and `vercel.json` in the repository.

### Step 3: Import the Repository into Vercel

1. Visit [vercel.com](https://vercel.com/) and sign in.
2. Choose **Add New > Project** and connect your GitHub account if requested.
3. Import the repository containing this project.
4. Use these settings, checking any automatically detected values:

| Setting          | Value                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Framework preset | Vite                                                                                           |
| Root directory   | The folder containing `package.json`; leave the default if it is at the repository's top level |
| Install command  | `bun install`                                                                                  |
| Build command    | `bun run build`                                                                                |
| Output directory | `dist`                                                                                         |
| Node.js version  | A currently supported LTS release                                                              |

### Step 4: Add the Online Connection Settings

In the project's **Environment Variables**, add:

| Name                     | Value                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `SITE_URL`               | Your public website address, such as `https://your-project.vercel.app`, with no invitation query parameters |
| `VITE_SUPABASE_URL`      | Your Supabase Project URL, only if using personalised invitations                                           |
| `VITE_SUPABASE_ANON_KEY` | Your public anon or publishable key, only if using personalised invitations                                 |

Your local `.env.local` is not uploaded, so these values must also be added
in Vercel. Apply them to **Production** and also **Preview** if you want guest
features in preview deployments.

If you do not know the public address yet, Vercel normally supplies a default
address during deployment. After the first deployment, copy that address into
`SITE_URL` and redeploy. Without an explicit `SITE_URL`, the project uses
Vercel's supplied production/deployment hostname when available.

### Step 5: Deploy and Test the Public Link

1. Select **Deploy** and wait for the build to finish.
2. Open the public address Vercel provides.
3. Check `/?side=groom`, `/?side=bride`, and `/?side=bride&lang=gu`.
4. If using personal invitations, open `/admin` on this public address and test a guest link.
5. Open the public link on your phone with Wi-Fi turned off to confirm it works outside your computer.

Send this public address to guests, not a `localhost` address.

For a custom domain, add it in Vercel's **Settings > Domains** and follow the
instructions for your domain provider. Update `SITE_URL` to the new HTTPS
address and redeploy before copying and sharing new guest links.

**After later changes:** save and upload your changes to the connected GitHub
repository. Vercel builds a new deployment. Changes to Vercel environment
variables also need a redeployment to take effect.

### Link Previews and Other Hosting Services

Vercel serves different preview titles and images for the groom and bride
versions. Personal links can also show the guest's name and message in the
preview that messaging apps display.

Messaging platforms may cache old previews. A successful deployment does not
guarantee they immediately show a new image or wording.

Other services can host the standard `dist` website, but they need equivalent
routing for `/admin` and side-specific previews. Personalised social previews
also need server functions equivalent to those in `api/`. Uploading `dist`
alone does not provide those functions. Vercel is the simplest supported path here.

## Troubleshooting

| Problem                                              | What to try                                                                                                                                                                   |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` or `bun` is "not found" or "not recognized"   | Close and reopen the editor and terminal after installation. If it still fails, revisit the official installer's PATH instructions; PATH is how your computer finds commands. |
| Cannot find `package.json`                           | Open the actual project folder, not its parent or a ZIP file, then create a new editor terminal.                                                                              |
| Dependency installation fails                        | Check your connection and the first error shown. Confirm you installed current Node.js LTS and Bun, then retry `bun install`.                                                 |
| Browser says the site cannot be reached              | Keep `bun run dev` running and use the exact Local address printed in the terminal.                                                                                           |
| Port `5173` is already in use                        | Use the alternative port printed by Vite. Stop an old project server with Ctrl+C if you no longer need it.                                                                    |
| Blank page or error after editing                    | Undo your most recent edit, save, and check the terminal for the error. Missing quotes, commas, or brackets are common causes.                                                |
| Admin says Supabase is not configured                | Check `.env.local` is next to `package.json`, has both correctly spelled settings, and is not a `.txt` file. Restart the server.                                              |
| Admin sign-in fails                                  | Use the Supabase Auth user's password, not the database password. Check the email is confirmed.                                                                               |
| Sign-in succeeds but access is denied                | Add the exact lowercase Auth email to `private.invitation_admins` in the same Supabase project.                                                                               |
| Invitations cannot be created or loaded              | Check the migration ran successfully and the URL and public key belong to that same project. Do not disable database security rules.                                          |
| A personal link shows the standard invitation        | Check that it was copied fully, is active, and uses the original groom/bride side. Invalid links or connection failures fall back to the standard page.                       |
| Changes to `.env.local` do not appear                | Save, stop the server with Ctrl+C, and start it again. Check whether an existing `.env` or terminal environment also defines those settings.                                  |
| Online personal invitations fail but local ones work | Add the Supabase settings to the correct Vercel environment and redeploy.                                                                                                     |
| Preview build does not open                          | Run `bun run build` successfully before `bun run preview`.                                                                                                                    |
| Music does not start automatically                   | Browsers often require a click or tap first. Use the site's play button.                                                                                                      |
| A guest cannot open a link you sent                  | Make sure it starts with your public HTTPS address, not `localhost`.                                                                                                          |
| Shared previews have an old image or wrong domain    | Check `SITE_URL`, redeploy, and allow for the messaging platform's cached preview.                                                                                            |

If you need help, share the command you ran and the first error message.
Do not share passwords, secret keys, `.env.local`, or a real guest's personal link.

## Technical Reference

This section is optional; it is not needed to follow the setup guide.

### Commands

Run these in the folder containing `package.json`.

| Command                          | Purpose                                                          |
| -------------------------------- | ---------------------------------------------------------------- |
| `bun install`                    | Install project dependencies                                     |
| `bun run dev`                    | Start the local development server with automatic updates        |
| `bun run build`                  | Build the website and social-preview assets into `dist`          |
| `bun run preview`                | Serve an existing build locally                                  |
| `bun run lint`                   | Check JavaScript/React code with ESLint; this does not run tests |
| `node --test scripts/*.test.mjs` | Run the included automated tests in a Mac/Linux shell            |

On Windows PowerShell, run the test files explicitly:

```powershell
node --test scripts/i18n.test.mjs scripts/invitation-card.test.mjs scripts/personal-preview.test.mjs scripts/social-fonts.test.mjs scripts/social-preview.test.mjs
```

The build command uses Node.js and Vite; it does not perform a separate
TypeScript check. Avoid switching package managers casually, since the
repository's committed lockfile is `bun.lockb`.

### Files and Technologies

| File or folder                               | Purpose                                                  |
| -------------------------------------------- | -------------------------------------------------------- |
| `src/routes/index.jsx`                       | Main invitation page                                     |
| `src/routes/admin.jsx`                       | Admin sign-in and invitation management                  |
| `src/wedding.js`                             | Wedding data for both sides                              |
| `src/i18n.js`, `src/translations-gu.js`      | Language selection and Gujarati copy                     |
| `src/index.css`, `src/theme.js`              | Styling and theme preferences                            |
| `src/supabase.js`                            | Browser database connection and invitation access        |
| `src/routeTree.gen.ts`                       | Generated routing file; do not edit manually             |
| `supabase/migrations/`                       | Database tables, functions, and admin access setup       |
| `scripts/social-preview.mjs`                 | Side-specific preview HTML and images                    |
| `scripts/personal-preview.mjs`               | Personalised preview handlers                            |
| `scripts/social-fonts.mjs`, `scripts/fonts/` | Script-aware text rendering and licensed preview fonts   |
| `api/`                                       | Vercel personalised preview endpoints                    |
| `vercel.json`                                | Hosting routes, build settings, and function assets      |
| `.env.example`                               | Example connection-setting names                         |
| `package.json`, `bun.lockb`                  | Commands, dependencies, and locked versions              |
| `dist/`, `node_modules/`                     | Generated output and installed dependencies; do not edit |

The site uses React 19, Vite 6, TanStack Router, Tailwind CSS 4, Motion, Lucide
icons, and Supabase. Preview generation uses Sharp and Fontkit.

### Privacy and Social-Preview Notes

- Anonymous visitors cannot list or directly modify `public.invitations`. They resolve one active record through `public.resolve_invitation(token, side)`.
- Personal tokens contain 64 hexadecimal characters and are locked to one side. Invalid, paused, deleted, or wrong-side links return the standard invitation.
- Admin access is checked by `public.is_invitation_admin()` against the verified account email in `private.invitation_admins`.
- Removing an email from the allowlist revokes its admin access on the next request.
- `api/invitation.mjs` provides personalised HTML metadata; `api/invitation-image.mjs` provides a 1200 x 630 JPEG.
- Personal preview endpoints use `private, no-store` and `noindex` headers, but external platforms can still keep their own cached copies.
- Personal preview image schedules are in English; metadata supports Gujarati. Bundled Noto fonts support Gujarati and Devanagari guest text.
- Keep the font files, their licences, and the function `includeFiles` settings in `vercel.json`. Server rendering does not require system fonts or Fontconfig.
- Keep Vercel's personal-link and side-specific routes before its filesystem handler so the root `index.html` does not bypass them.
- Server preview handlers can alternatively use `SUPABASE_URL` and `SUPABASE_ANON_KEY`; the browser still needs the `VITE_` settings. No service-role key is required.

### Accessibility and Motion

The site includes keyboard focus styles, a skip link, accessible labels, and
reduced-motion support. Animation is disabled or reduced when the device asks
for reduced motion. Test changes on mobile as well as desktop, including both
themes and languages.

## Usage and Artwork

This project is for Vishal and Krishi's wedding and personal/family use.
Contact the couple's families for permission before reusing or redistributing
the custom artwork or prose. Bundled fonts have their own licence files in
`scripts/fonts/`; keep those with the fonts.

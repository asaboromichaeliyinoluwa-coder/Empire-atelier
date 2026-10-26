# Setting up sign-in with Google and phone number

Email sign-in works straight away. Google and phone sign-in need a few free keys. Until you add them the
buttons stay in the screen and show a friendly "isn't switched on yet" message, so nothing breaks.

Where do the keys go?
- **On Vercel:** your project > **Settings** > **Environment Variables**. Add each key (name exactly as written), tick Production, Preview and Development, **Save**, then **Deployments** > the three dots on the latest deployment > **Redeploy**.
- **On your Windows computer (portable app):** open the `.env` file in the `empire-atelier` folder with Notepad, paste each key after its `=`, save, close the black window and run `start.bat` again.

## A. Sign in with Google (5 minutes, free)

1. Go to https://console.cloud.google.com and sign in with your Google (Gmail) account.
2. Top bar > project picker > **New project**. Name it `Empire Atelier` > **Create**. Make sure it is selected.
3. Left menu > **APIs & Services** > **OAuth consent screen** (it may be called **Google Auth Platform**). Click **Get started**.
   - App name: `Empire Atelier`. User support email: your Gmail. **Next**.
   - Audience: **External**. **Next**. Contact email: your Gmail. **Next**, tick the agreement, **Continue**, **Create**.
4. Left menu > **Clients** (or **Credentials** > **Create credentials** > **OAuth client ID**). Click **Create client**.
   - Application type: **Web application**. Name: `Empire Atelier web`.
   - Under **Authorized JavaScript origins** click **Add URI** and enter your website address, for example `https://your-app.vercel.app` (no slash at the end). Click **Add URI** again and enter `http://localhost:1010` so it works on your own computer too. If you later add a custom domain, add that here too.
   - Leave "Authorized redirect URIs" empty. Click **Create**.
5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`). Add it as `GOOGLE_CLIENT_ID`.
6. Left menu > **Audience** > **Publish app** > **Confirm**, so anyone with a Gmail can sign in (otherwise only test users you list can).

## B. Sign in with a phone number (10 minutes, small cost per text)

Text codes are sent through Twilio Verify, which works the same on Vercel and on Windows.

1. Go to https://www.twilio.com/try-twilio and create a free account (it asks you to verify your own phone number).
2. In the Twilio Console, copy **Account SID** and **Auth Token** from the dashboard (click the eye to reveal the token). Add them as `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
3. Left menu > **Explore Products** > **Verify** > **Services** > **Create new**. Name: `Empire Atelier`. Tick **SMS** > **Create**.
4. Copy the service's **Service SID** (starts with `VA`). Add it as `TWILIO_VERIFY_SERVICE_SID`.
5. **Trial accounts can only text numbers you have verified** in Twilio (Console > **Phone Numbers** > **Verified Caller IDs** > **Add**). To text any customer, **Upgrade** the account (add a card; each code costs about a cent or two, more in some countries). Some countries need extra sender registration. Twilio's Verify pages explain it.

## C. Accounts database on Vercel

Vercel forgets files, so add the free database once: your project > **Storage** > **Create** > **Upstash Redis** > pick the free plan > **Connect to project** > **Redeploy**. (Vercel adds the keys by itself.) The Windows app needs nothing: accounts are saved in its `data` folder.

## Check it works

Open the site > the person icon in the header > **Continue with Google** (you should see Google's account chooser) and **Phone number** (type your number with the country code, such as `+234 801 234 5678`, tap **Text me a code**, enter the code).

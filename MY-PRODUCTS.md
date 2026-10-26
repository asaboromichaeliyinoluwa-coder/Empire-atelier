# Adding your own real products and photos

Empire Atelier has a **My products** page where you add the items you actually sell, with your own photos,
prices, sizes, colours and a link to buy. They appear in the shop straight away with a **“Product photo”**
label, next to the studio-rendered catalogue.

## Before you start

- **Use only photos you took yourself** (or have written permission to use). Do not use photos copied from
  other websites, brand pages or other sellers.
- **Only list what you are allowed to sell, under its true name.** Do not put another company’s name or logo
  on your listing, and do not describe an item as authentic branded goods unless it is, and you are authorised
  to sell it. Items with another company’s logo or packaging in the photo are best shown cropped, or under your
  own label.
- A good photo: daylight, plain background, the whole item in frame, sharp, at least 1000 pixels tall.
  Add a second photo of the back and a third of a detail (label, stitching, material).

## Steps (browser or the Windows app)

1. Open your site. At the bottom of any page, under **You**, tap **My products (shop owner)**.
2. **Sign in** (or create an account). On the Windows app this just works. On Vercel your accounts need the free
   Upstash Redis database from `SETUP-SIGNIN.md` first, because photos are stored there too.
3. The first time, tap **Make me the shop owner**. Do this yourself straight after you deploy, before anyone
   else signs up. (To name owners in advance, set `ADMIN_EMAILS` to your email on the server instead.)
4. Tap **Edit store details** and set your store name, city, website and how buyers reach you (for example a
   WhatsApp number).
5. Tap **Add a product**, then:
   - **Add photos** (up to 8). The first one is the main photo; use **Make main** to change it. Photos are
     shrunk automatically so the shop stays fast.
   - Fill in **Name, Category, Made for, Price**. Add **Old price** if it is on sale.
   - Pick the **Colour** (swatch and name). If you sell the same item in several colours, add each colour as its
     own product and type the **same Colour group** word (for example `rib-tank`); the shop shows them as colour
     swatches of one item.
   - Tick the **Sizes** you have, add a **Description**, and paste the link where people buy (WhatsApp,
     Instagram, or your website). If you leave the link empty, buyers see how to contact you instead.
   - For clothing you can tick **Offer virtual try-on**. It works best with a clean photo of the item on a plain
     background.
6. Tap **Save product**. It is in the shop immediately. Use **Edit** or **Delete** in “Your products” any time.

## Good to know

- Your products and photos are saved with your accounts: the `data/` folder in the Windows app (keep it when you
  update), or your Upstash Redis database on Vercel.
- The hosted preview has no server, so products you add there are saved only in your browser. The page shows a
  **Download my products file** button as a backup.
- Each photo is limited to about 500 KB after shrinking, and 8 photos per product.
- You can mix: real products you add, plus the studio-rendered catalogue. To remove the demo catalogue and keep
  only your own items, tell me and I will switch it off.

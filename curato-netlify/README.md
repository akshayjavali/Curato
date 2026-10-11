# Curato — affiliate storefront & content studio

A responsive editorial storefront with product details, search, category filters, price sorting, saved favorites, a journal, and a password-protected content studio. Designed for Netlify, with Netlify Functions and durable Netlify Blobs storage. No separate database account is needed.

## Deploy on Netlify

1. Unzip this project and upload its contents to a GitHub repository. Keep `package.json`, `netlify.toml`, `public`, and `netlify` at the repository root.
2. In Netlify, choose **Add new project → Import an existing project**, then connect the repository.
3. Use the settings in `netlify.toml`: build command **npm run build**, publish directory **public**, functions directory **netlify/functions**. Netlify installs dependencies automatically.
4. Before launch, set **ADMIN_PASSWORD** in Netlify's project environment variables. Use a unique, randomly generated password of at least 16 characters. Make it available to Functions (or all scopes). Do not put it in source files. Redeploy after setting or changing it.
5. Open your deployed site, then visit **/admin.html** and sign in with that password.
6. Replace/delete the sample products and articles, add your affiliate links and licensed product images, and save. Changes are stored in Netlify Blobs and appear without rebuilding the site.

**Deploy the complete project through Git or the Netlify CLI. Dragging only `public/` into Netlify Drop will not deploy the backend.** This delivery is a source package; no production Netlify site or account was created.

## Use the content studio

- Add, edit, and delete products and journal articles.
- Products support name, category, price, currency, retailer, HTTPS affiliate URL, HTTPS image URL, badge, description, specifications, and featured status.
- Enter any category name to create a new storefront filter. Images use hosted URLs; upload your images to your preferred image host and paste the URL.
- Articles support title, category, image, date, excerpt, and plain-text body. Blank lines separate paragraphs. Saving publishes immediately; there are no drafts or scheduled publishing.
- URL IDs must be unique within the content type. An existing ID stays fixed to preserve links.
- A blank affiliate URL shows a sample notice and disables retailer shopping. Sample photos are illustrative, not verified photos of named commercial products.
- Prices and product specifications are manually maintained. Affiliate links must come from your own retailer/affiliate accounts.
- Checkout, payment, delivery, and returns happen on the retailer's website.

## Local preview and checks

With Node.js 22 or later installed:

```sh
npm install
npm run build
npm test
npm run dev
```

Open http://127.0.0.1:4173. This preview shows starter content and is deliberately read-only. Test real persistence and secure admin cookies on a deployed Netlify HTTPS site. The automated API tests use an in-memory storage adapter; they do not verify your Netlify account's storage provisioning.

## Branding and maintenance

- Change the Curato name in `public/index.html`, `public/admin.html`, `public/app.js`, and `public/admin.js`.
- Adjust colors and layout in `public/style.css`.
- Initial demo content is in `public/seed.json`. Admin edits override those records; deleted samples stay deleted across deployments.
- Keep a copy of original content. Stored records reside in the site's `curato-content` Netlify Blobs store, not in Git. Export/back up that store before moving or deleting the Netlify project.
- This is a single-owner content studio. Sessions use a signed, Secure, HttpOnly, SameSite cookie that expires after eight hours. Changing the password invalidates all existing sessions. Sign-out clears the browser cookie. API writes verify the request origin; API requests are rate-limited by IP/domain.
- Simultaneous edits to the same record use last-write-wins. Unrelated records are saved independently.
- Product and article pages have stable links and dynamic titles/descriptions. Content is rendered in the browser; server-rendered SEO pages, social preview cards, image uploads, analytics, and a sitemap are not included.
- Favorites stay in the visitor's browser. No email addresses, payment data, or customer accounts are collected. Remote images contact their hosting provider.

## References

- [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Function environment variables](https://docs.netlify.com/build/functions/environment-variables/)
- [Netlify rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)

## Verification

Automated tests cover session signing, expiration, unsafe URL rejection, unauthenticated writes, origin protection, login, product/article creation and editing, deletion, and persistence through repeated API reads using a storage adapter. Real deployment and production storage still need to be verified after connecting your Netlify account.

All three automated test groups passed during creation, and JavaScript syntax checks passed. Browser preview verification was blocked by the local environment's networking restrictions; dependency installation was blocked by Windows symlink permissions. A production dependency install and deployment must therefore still be verified on Netlify.

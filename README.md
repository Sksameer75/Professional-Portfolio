# Shaik Sameer Basha — Portfolio

Static portfolio website (Baskara-style yellow / black / white design).

## Structure

```
.
├── index.html          # Page content only
├── css/
│   └── style.css       # All styling
├── js/
│   └── script.js       # Scroll animations, hero hover, custom cursor
└── images/
    ├── hero-portrait.png        # Hero photo (background removed)
    ├── about-photo.jpg          # About section photo
    ├── nexlead-dashboard.jpg    # NEXLEAD project screenshot
    ├── api-intelligence.jpg     # API Intelligence project screenshot
    └── calibguard-dashboard.jpg # CalibGuard project screenshot
```

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Add portfolio website"
git branch -M main
git remote add origin https://github.com/Sksameer75/sameer-portfolio.git
git push -u origin main
```

(Replace the repo URL with your own repo if you name it differently.)

## Deploy on Vercel

Option A — from GitHub (recommended, auto-deploys on every push):

1. Go to https://vercel.com → **Add New → Project**
2. Import this repo, leave Framework Preset as **Other**
3. Click **Deploy**

Option B — from the command line:

```bash
npx vercel --prod
```

No build command is needed — this is a plain static site.

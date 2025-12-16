# Customization Checklist

Use this checklist when setting up your portfolio for the first time.

## 🔧 Initial Setup

### 1. Environment Variables

- [ ] Backend `.env` - Set `DATABASE_URL`
- [ ] Backend `.env` - Set `JWT_SECRET` (use secure random string)
- [ ] Backend `.env` - Set `ADMIN_EMAIL` (your email)
- [ ] Backend `.env` - Set `ADMIN_PASSWORD` (secure password)
- [ ] Backend `.env` - Set `ALLOWED_ORIGINS` (your frontend URL)
- [ ] Frontend `.env` - Set `VITE_API_URL` (your backend URL)

### 2. Database Setup

- [ ] Create PostgreSQL database
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npm run db:seed` (optional, for sample data)

### 3. Verify Installation

- [ ] Backend runs at http://localhost:3000
- [ ] Frontend runs at http://localhost:5173
- [ ] Can access admin login page
- [ ] Can log in with admin credentials

## 🎨 Branding & Content

### 4. Site Information

**File: `frontend/index.html`**
- [ ] Update `<title>` tag with your name and title
- [ ] Update meta description
- [ ] Update meta keywords
- [ ] Update Open Graph tags (og:title, og:description)
- [ ] Update Twitter Card tags
- [ ] Update JSON-LD structured data (name, jobTitle, description)

### 5. About Page

**Via Admin Panel: `/admin/about`**
- [ ] Add your name
- [ ] Add your professional title
- [ ] Write your bio (supports Markdown)
- [ ] Add profile picture URL
- [ ] Add email address
- [ ] Add phone number (optional)
- [ ] Add location
- [ ] Add social media links (LinkedIn, GitHub, Twitter, etc.)

### 6. Navigation & Footer

**File: `frontend/src/components/Navigation.tsx`**
- [ ] Update site logo/name
- [ ] Add/remove navigation links as needed
- [ ] Update mobile menu

**File: `frontend/src/components/Footer.tsx`**
- [ ] Update footer text
- [ ] Update copyright year
- [ ] Update social links

### 7. Theme Colors

**File: `frontend/tailwind.config.ts`**
- [ ] Update primary color
- [ ] Update secondary color
- [ ] Update accent colors (optional)
- [ ] Update font family (optional)

### 8. Favicon

**Files in `frontend/public/`**
- [ ] Replace `favicon.ico`
- [ ] Replace `favicon-16x16.png`
- [ ] Replace `favicon-32x32.png`
- [ ] Replace `apple-touch-icon.png`
- [ ] Replace `android-chrome-192x192.png`
- [ ] Replace `android-chrome-512x512.png`

**Generate favicons at:** [RealFaviconGenerator](https://realfavicongenerator.net/)

## 📝 Content

### 9. Projects

**Via Admin Panel: `/admin/projects`**
- [ ] Add your research projects
- [ ] Upload project images
- [ ] Add detailed descriptions
- [ ] Tag projects appropriately
- [ ] Mark featured projects

### 10. Publications

**Via Admin Panel: `/admin/publications`**
- [ ] Add your articles
- [ ] Link to external publications (Medium, Substack, etc.)
- [ ] Tag publications
- [ ] Mark featured publications

### 11. Guidebooks

**Via Admin Panel: `/admin/guidebooks`**
- [ ] Create curated learning paths
- [ ] Add publications to guidebooks
- [ ] Organize by area/category
- [ ] Define target audience

### 12. Tags

**Via Admin Panel: `/admin/tags`**
- [ ] Create tags for Research Methods
- [ ] Create tags for Industries
- [ ] Create tags for Topics
- [ ] Create tags for Tools
- [ ] Create tags for Skills

## 🔒 Security

### 13. Production Security

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Review and remove any test data
- [ ] Enable rate limiting on contact form
- [ ] Set up environment variables in hosting platform

## 🚀 Deployment

### 14. Pre-Deployment

- [ ] Test all features locally
- [ ] Run `npm run build` for both backend and frontend
- [ ] Fix any TypeScript errors
- [ ] Update environment variables for production
- [ ] Create production database
- [ ] Run database migrations in production

### 15. Domain & DNS

- [ ] Register domain name
- [ ] Configure DNS records
- [ ] Set up SSL certificate
- [ ] Update `ALLOWED_ORIGINS` with production domain
- [ ] Update `VITE_API_URL` with production backend URL

### 16. Post-Deployment

- [ ] Verify site loads at your domain
- [ ] Test admin login
- [ ] Test all CRUD operations
- [ ] Test contact form
- [ ] Check mobile responsiveness
- [ ] Test in multiple browsers
- [ ] Set up monitoring/analytics (optional)

## 📊 Analytics & SEO (Optional)

### 17. Analytics

- [ ] Set up Google Analytics
- [ ] Add GA tracking code to `frontend/index.html`
- [ ] Configure goals and events

### 18. SEO

- [ ] Submit sitemap to Google Search Console
- [ ] Verify site ownership
- [ ] Add meta tags for social sharing
- [ ] Optimize images with alt text
- [ ] Add structured data (JSON-LD)

## 🔄 Ongoing Maintenance

### 19. Regular Tasks

- [ ] Keep dependencies updated
- [ ] Backup database regularly
- [ ] Monitor error logs
- [ ] Review security vulnerabilities
- [ ] Update content regularly
- [ ] Respond to contact form submissions

## ✅ Launch Checklist

Before going live:

- [ ] All branding updated
- [ ] Content added (at least 2-3 projects, publications)
- [ ] About page complete with profile picture
- [ ] Admin password changed from default
- [ ] Contact form tested and working
- [ ] Mobile experience tested
- [ ] All links working
- [ ] Favicon displaying correctly
- [ ] SSL certificate active
- [ ] No console errors
- [ ] Loading states work correctly

## 🎉 You're Ready!

Once all items are checked, your portfolio is ready to launch!

**Need help?** Check the [Documentation](./Docs/README.md) or open an [Issue](https://github.com/yourusername/portfolio/issues).

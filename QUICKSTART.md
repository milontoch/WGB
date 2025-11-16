# 🚀 Quick Start Guide - Beauty Services Website

## Installation Steps

### 1️⃣ Install Dependencies

```powershell
npm install
```

### 2️⃣ Install Required Utility Packages

```powershell
npm install clsx tailwind-merge tailwindcss-animate
```

### 3️⃣ Start Development Server

```powershell
npm run dev
```

### 4️⃣ Open Browser

Navigate to: `http://localhost:3000`

---

## ✅ What's Included

- ✨ Modern landing page with hero section
- 🎨 Beauty-industry themed design (pink/purple)
- 📱 Fully responsive layout
- 🧭 Professional navigation header
- 🔗 Footer with links and contact info
- 🎯 Call-to-action sections
- 🏗️ shadcn/ui ready for component additions

---

## 🎨 Customization

### Change Brand Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: 340 82% 52%; /* Change primary color */
}
```

### Add Your Logo

Replace "BeautyCo" text in:

- `src/components/navigation.tsx`
- `src/components/footer.tsx`

### Add Images

Place images in `/public` folder and reference them:

```tsx
<Image src="/your-image.jpg" alt="Description" />
```

---

## 📦 Available Commands

```powershell
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Check for code issues
```

---

## 🔧 Adding More UI Components

Install shadcn/ui components as needed:

```powershell
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

Browse all components: https://ui.shadcn.com/

---

## ✨ Next Steps

1. **Customize Content**: Update text, images, and branding
2. **Add Real Images**: Replace emoji placeholders with professional photos
3. **Customize Colors**: Adjust the color scheme in globals.css
4. **Test Responsiveness**: Check on different screen sizes
5. **Prepare for Phase 2**: Plan Supabase integration

---

**Need Help?** Check README.md for detailed documentation.

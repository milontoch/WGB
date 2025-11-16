# Beauty Services Website - Phase 1

A modern, full-featured beauty services website with booking and e-commerce capabilities built with Next.js, TypeScript, and TailwindCSS.

## 🚀 Phase 1: Project Setup Complete

### Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (ready to use)
- **React 18**

## 📁 Project Structure

```
WGB/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles with Tailwind
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx     # Reusable button component
│   │   ├── navigation.tsx     # Header navigation
│   │   └── footer.tsx         # Footer component
│   └── lib/
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
├── postcss.config.js          # PostCSS configuration
├── components.json            # shadcn/ui configuration
└── package.json               # Dependencies
```

## 🛠️ Installation Instructions

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### Step 2: Install Additional Required Packages

Install the utility libraries needed for shadcn/ui components:

```powershell
npm install clsx tailwind-merge tailwindcss-animate
```

### Step 3: Start the Development Server

```powershell
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎨 Features Included

### Landing Page

- ✅ Professional hero section with gradient background
- ✅ Call-to-action buttons
- ✅ Statistics showcase (clients, services, experience)
- ✅ "Why Choose Us" features section
- ✅ Services preview grid
- ✅ Call-to-action section
- ✅ Responsive design (mobile, tablet, desktop)

### Navigation

- ✅ Fixed header with logo
- ✅ Navigation links (Services, Shop, About, Contact)
- ✅ "Book Now" CTA button
- ✅ Mobile menu button (ready for implementation)
- ✅ Smooth hover effects

### Footer

- ✅ Multi-column layout
- ✅ Brand information
- ✅ Quick links (Services, Company, Contact)
- ✅ Contact information
- ✅ Bottom bar with copyright and legal links

### Design System

- ✅ Beauty-industry color scheme (pink/purple primary colors)
- ✅ Professional typography
- ✅ Consistent spacing and layout
- ✅ Smooth transitions and hover effects
- ✅ shadcn/ui ready for component additions

## 🎯 Available Scripts

```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔧 Adding shadcn/ui Components (Optional)

When you need additional UI components, use:

```powershell
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc.
```

## 🎨 Color Scheme

The project uses a beauty-industry inspired color palette:

- **Primary**: Pink/Rose (`hsl(340, 82%, 52%)`)
- **Background**: White
- **Text**: Gray scale
- **Accents**: Purple tones

You can customize colors in `src/app/globals.css` (CSS variables) and `tailwind.config.js`.

## 📱 Responsive Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: sm (640px+), md (768px+)
- **Desktop**: lg (1024px+), xl (1280px+), 2xl (1400px+)

## ✨ What's Next (Future Phases)

- Phase 2: Supabase integration for backend
- Phase 3: Booking system
- Phase 4: E-commerce functionality
- Phase 5: User authentication
- Phase 6: Admin dashboard

## 📝 Notes

- All components use TypeScript for type safety
- Functional components with modern React patterns
- TailwindCSS utility classes for styling
- No external state management yet (will add in future phases)
- Images are placeholders (add actual images to `/public` folder)

## 🆘 Troubleshooting

If you encounter any issues:

1. **Clear node_modules and reinstall**:

   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

2. **Clear Next.js cache**:

   ```powershell
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

3. **Check Node version** (should be 18+):
   ```powershell
   node --version
   ```

---

**Project Status**: Phase 1 Complete ✅
**Last Updated**: November 14, 2025

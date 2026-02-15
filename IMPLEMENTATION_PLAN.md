# LoomGrad Technical LMS - Implementation Plan

## Phase 1: Foundation & Infrastructure
- [x] Setup `.env` file with necessary variables (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.)
- [x] Initialize Prisma and design the Schema (Users, Courses, Modules, Lessons, Progress, CodeSubmissions)
- [x] Configure NextAuth.js v5 (Auth.js) for authentication (Google OAuth)
- [ ] Install and configure Shadcn/UI and Aceternity UI components
- [x] Create utility files in `lib/` (prisma.ts, auth.ts, youtube.ts)

## Phase 2: Admin Dashboard - Automated Import System
- [x] Create `lib/youtube.ts` to fetch playlist data from YouTube API
- [x] Build the One-Click Import page (`app/admin/import/page.tsx`)
- [x] Implement Server Action for importing and mapping videos to Lessons
- [x] Logic for setting the first video as free (`isFree: true`)

## Phase 3: Student Experience - Layout & Navigation
- [x] Build the Landing Page using Aceternity 'Spotlight' and 'Bento Grid'
- [x] Create the Course Catalog with search and filters
- [x] Implement Framer Motion Sidebar for module switching

## Phase 4: Learning Experience & Code Editor
- [x] Build the Split Lesson Viewer (Video Player + Markdown Notes)
- [x] Integrate Monaco Editor for interactive coding practice
- [ ] Implement Progress Tracking with automatic database updates

## Phase 5: Payment System & Paywall
- [x] Design the Animated Paywall using Framer Motion "Blur-in" effect
- [x] Integrate Razorpay Checkout for subscriptions
- [x] Create Webhook (`api/razorpay/webhook/route.ts`) for payment verification and status updates

## Phase 6: Polish & Quality Assurance
- [x] Add Confetti interaction on coding challenge completion
- [ ] Enhance SEO and add Metadata for all pages
- [x] Ensure full Mobile Responsiveness
- [ ] Performance optimization (Targeting high Lighthouse scores)

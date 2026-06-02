Luvoro Labs

Luvoro Labs is an interactive AP learning platform designed to help students study, practice, and track their progress through course-based lessons and assessments.

The app currently focuses on AP Physics 1, with additional AP subjects planned. It includes user authentication, progress tracking, interactive lessons, unit tests, accessibility tools, and AI-assisted free-response grading.


Features

* Course catalog for AP subject exploration
* AP Physics 1 course content with modules, lessons, and unit tests
* User authentication powered by Supabase
* Progress tracking for completed lessons and course advancement
* Locked module flow so students progress through content in order
* Timed unit tests with multiple-choice and free-response questions
* AI-assisted grading for free-response answers
* Testing tools including calculator, zoom controls, line reader, read-aloud support, answer elimination, and mark-for-review
* Dashboard, profile, and settings pages
* Responsive UI built with React, Tailwind CSS, and shadcn/ui components
* Mobile app support through Capacitor for Android and iOS

Tech Stack

* Frontend: React, TypeScript, Vite
* Styling: Tailwind CSS, shadcn/ui, Radix UI
* Routing: React Router
* State/Data: TanStack React Query
* Backend: Supabase
* AI: OpenAI integration through Supabase functions
* Mobile: Capacitor
* Deployment: Vercel

Project Structure

LuvoroLabs1/
├── android/                         # Capacitor Android project
├── ios/                             # Capacitor iOS project
├── public/                          # Static assets
├── src/                             # Main React application
│   ├── components/                  # Reusable UI and app components
│   ├── context/                     # React context providers
│   ├── lib/                         # Shared library utilities
│   ├── pages/                       # App pages and routes
│   └── utils/                       # Course content and Supabase helpers
├── supabase/functions/grade-free-response/
│                                      # AI grading edge function
├── SQL_COMMANDS.sql                 # Database setup / SQL commands
├── capacitor.config.ts              # Capacitor configuration
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite configuration
└── package.json                     # Scripts and dependencies

Getting Started

Prerequisites

Make sure you have the following installed:

* Node.js
* pnpm
* Supabase project credentials

Installation

Clone the repository:

git clone https://github.com/unknown1231230/LuvoroLabs1.git
cd LuvoroLabs1

Install dependencies:

pnpm install

Create an environment file:

cp .env.example .env

Then add your required Supabase and API environment variables.

Note: If .env.example does not exist yet, create a .env file manually and add the required project keys used by your Supabase client and edge functions.

Run the development server:

pnpm dev

Open the local URL shown in your terminal, usually:

http://localhost:5173

Available Scripts

pnpm dev

Start the local development server.

pnpm build

Create a production build.

pnpm build:dev

Create a development-mode build.

pnpm preview

Preview the production build locally.

pnpm lint

Run ESLint checks.

Supabase Setup

This project uses Supabase for authentication, user data, progress tracking, unit test sessions, answers, site metrics, and AI grading support.

Database setup commands are included in:

SQL_COMMANDS.sql

The free-response grading function is located at:

supabase/functions/grade-free-response/

Before running the full app, make sure your Supabase tables, authentication settings, policies, and function environment variables are configured correctly.

Mobile Development

This project includes Capacitor support for Android and iOS.

After building the web app, sync Capacitor:

pnpm build
npx cap sync

Open the native projects:

npx cap open android

or

npx cap open ios

Current Course Status

Available

* AP Physics 1

Planned

* AP Chemistry
* AP Biology

Roadmap

* Expand AP Physics 1 lesson and module coverage
* Add additional AP courses
* Improve unit test analytics and review tools
* Add more simulations and interactive labs
* Improve mobile experience
* Add more personalized learning insights

Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Run linting and build checks.
5. Open a pull request.

git checkout -b feature/your-feature-name
pnpm lint
pnpm build

License

No license has been specified yet.

If this project is intended to be open source, consider adding a license file such as MIT, Apache-2.0, or GPL-3.0.

Author

Created by the Luvoro Labs team.

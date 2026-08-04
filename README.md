# Habit Flow

A modern, full-stack habit tracking application designed to help users build and maintain positive daily routines. 

Habit Flow allows users to create habits, track daily completions, visualize their progress via a heatmap, and analyze their consistency over time.

## Tech Stack

This project is built using a modern full-stack web development ecosystem:

### Frontend
- **React (v19)**: Core UI framework.
- **TypeScript**: For static type safety and robust code.
- **Vite (v6)**: Extremely fast frontend build tool and development server.
- **Tailwind CSS (v4)**: Utility-first CSS framework for rapid and responsive styling.
- **Motion (`motion/react`)**: For smooth animations and transitions.
- **Lucide React**: Beautiful and consistent iconography.
- **Canvas Confetti**: For celebratory visual effects upon habit completion.

### Backend & API
- **Express (v5)**: Fast, unopinionated, minimalist web framework for Node.js.
- **Node.js**: JavaScript runtime environment.

### Database & ORM
- **Prisma (v7)**: Next-generation ORM for Node.js and TypeScript.
- **PostgreSQL**: Powerful, open-source object-relational database system.
- **@prisma/adapter-pg**: Prisma adapter for PostgreSQL.

### Authentication
- **Amazon Cognito**: Serverless identity management. Integrated using `amazon-cognito-identity-js` for user registration, sign-in, and session management.

## Project Structure

- `src/App.tsx`: Main application component acting as the layout and state container.
- `src/components/`: Modular React components (e.g., `Header`, `StatsOverview`, `HabitList`, `HeatmapView`, `AnalyticsView`, `Auth`).
- `src/api.ts`: Centralized API client for interacting with the backend.
- `server.ts`: Express server entry point that serves API routes and the compiled Vite frontend.
- `prisma/schema.prisma`: Prisma schema defining the database models (`Habit`, `HabitCompletion`).

## Getting Started

1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables (e.g., Database URL, Cognito keys) in a `.env` file based on `.env.example`.
4. Run database migrations:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
npm start
```

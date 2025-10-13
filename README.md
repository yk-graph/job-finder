# Job Finder

A comprehensive job aggregation and management system that scrapes job listings from multiple sources, stores them in a centralized database, and provides a modern web interface for job seekers.

## Overview

Job Finder is a monorepo project built with modern web technologies that automates the process of collecting, storing, and displaying job listings. The system uses web scraping to gather job information from various job boards (starting with Indeed), stores the data in DynamoDB, and presents it through a Next.js 15 web application with interactive map visualization.

## Features

- **Automated Job Scraping**: Scheduled scraping of job listings from multiple sources
- **Centralized Database**: DynamoDB-based storage for all job listings
- **Modern Web Interface**: Next.js 15 frontend with App Router and Server Components
- **Interactive Map View**: Google Maps integration for geographic job visualization
- **Real-time Updates**: Automatic synchronization of new job listings
- **Advanced Filtering**: Multi-criteria job search and filtering
- **Smart Notifications**: Slack integration for new job alerts
- **Spreadsheet Integration**: Export and sync with Google Sheets
- **Type Safety**: End-to-end TypeScript implementation
- **Monorepo Architecture**: Turborepo-powered workspace for efficient development
- **Component Documentation**: Storybook for UI component development and testing

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Google Maps API**: Interactive map visualization
- **Storybook**: Component development and documentation
- **Playwright**: E2E testing
- **Jest**: Unit testing

### Backend
- **AWS Lambda**: Serverless API functions
- **API Gateway**: RESTful API endpoints
- **Serverless Framework**: Infrastructure as Code
- **DynamoDB**: NoSQL database for job listings
- **Node.js**: Runtime environment (v22.0.4)

### Worker
- **Playwright**: Web scraping with stealth capabilities
- **Node.js**: Scheduled scraping tasks

### Infrastructure
- **Turborepo**: Monorepo build system
- **pnpm**: Package manager with workspace support
- **Volta**: Node.js version management
- **GitHub Actions**: CI/CD pipeline
- **MSW (Mock Service Worker)**: API mocking for testing

### Integrations
- **Slack API**: Job notifications
- **Google Sheets API**: Data export and synchronization

## Project Structure

```
project-root/
├── apps/                           # Application modules
│   ├── frontend/                   # Next.js 15 web application
│   │   ├── src/
│   │   │   ├── app/               # App Router pages & layouts
│   │   │   │   ├── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── jobs/          # Job listing pages
│   │   │   ├── components/
│   │   │   │   ├── JobCard.tsx
│   │   │   │   ├── MapView.tsx
│   │   │   │   └── FilterPanel.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts  # API client utilities
│   │   │   │   └── google-maps.ts # Google Maps integration
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── styles/            # Global styles
│   │   │   └── types/             # Frontend-specific types
│   │   ├── tests/
│   │   │   ├── e2e/               # Playwright E2E tests
│   │   │   └── unit/              # Jest unit tests
│   │   ├── .storybook/            # Storybook configuration
│   │   └── stories/               # Component stories
│   │
│   ├── backend/                    # AWS Lambda API
│   │   ├── src/
│   │   │   ├── handlers/          # Lambda function handlers
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── search.ts  # Job search endpoint
│   │   │   │   │   ├── filter.ts  # Filtering endpoint
│   │   │   │   │   └── detail.ts  # Job detail endpoint
│   │   │   │   └── health.ts      # Health check endpoint
│   │   │   ├── services/          # Business logic layer
│   │   │   │   ├── indeed-scraper.ts
│   │   │   │   └── job-cache.ts
│   │   │   ├── repositories/      # Data access layer
│   │   │   │   └── jobs.repository.ts
│   │   │   ├── middleware/
│   │   │   │   ├── error-handler.ts
│   │   │   │   └── cors.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── serverless.yml         # Serverless Framework config
│   │
│   └── worker/                     # Scraping worker
│       ├── src/
│       │   ├── index.ts           # Main entry point
│       │   ├── scrapers/          # Scraping logic
│       │   │   ├── indeed-scraper.ts
│       │   │   └── job-parser.ts
│       │   ├── tasks/             # Scheduled tasks
│       │   │   └── sync-jobs.ts
│       │   └── utils/
│       │       ├── logger.ts
│       │       └── retry.ts
│       └── .env.example
│
├── packages/                       # Shared packages
│   ├── shared/                    # Common code & type definitions
│   │   ├── src/
│   │   │   ├── types/            # Shared TypeScript types
│   │   │   │   ├── job.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── api.ts
│   │   │   ├── constants/
│   │   │   │   ├── job-types.ts
│   │   │   │   └── locations.ts
│   │   │   └── utils/            # Utility functions
│   │   │       ├── date.ts
│   │   │       └── validators.ts
│   │   └── package.json
│   │
│   ├── aws-clients/               # AWS SDK wrappers
│   │   ├── src/
│   │   │   ├── dynamodb.ts       # DynamoDB client
│   │   │   ├── s3.ts             # S3 client (future use)
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── external-apis/             # Third-party API integrations
│       ├── src/
│       │   ├── slack.ts          # Slack notifications
│       │   ├── spreadsheet.ts    # Google Sheets integration
│       │   └── index.ts
│       └── package.json
│
├── infrastructure/                # Infrastructure documentation
│   ├── README.md                 # Infrastructure overview
│   ├── aws/
│   │   ├── dynamodb/
│   │   │   └── setup.md         # DynamoDB table setup guide
│   │   ├── lambda/
│   │   │   └── configuration.md  # Lambda configuration guide
│   │   └── api-gateway/
│   │       └── setup.md         # API Gateway setup guide
│   └── github-actions/
│       └── setup.md              # GitHub Actions setup guide
│
├── docs/                          # Project documentation
│   ├── setup.md                  # Setup instructions
│   ├── architecture.md           # Architecture diagrams & explanations
│   ├── api-specification.md      # API specifications
│   └── deployment.md             # Deployment procedures
│
├── mocks/                         # MSW mock definitions
│   ├── handlers/
│   │   ├── jobs.ts
│   │   └── users.ts
│   └── server.ts
│
├── .vscode/                       # VS Code settings (team-shared)
│   └── settings.json             # Auto-format on save
│
├── .cursor/                       # Cursor settings (team-shared)
│   └── settings.json             # Auto-format on save
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI pipeline
│       └── deploy.yml            # Deployment pipeline
│
├── package.json                   # Root package with Volta config
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── turbo.json                     # Turborepo configuration
├── .gitignore
├── .npmrc
├── .editorconfig                  # Editor common settings
├── .prettierrc.json              # Prettier configuration
├── .eslintrc.json                # ESLint configuration
└── README.md
```

## Prerequisites

- **Node.js**: v22.0.4 (managed via Volta)
- **pnpm**: v8.0.0 or higher
- **AWS Account**: For Lambda, DynamoDB, and API Gateway
- **Google Cloud Project**: For Maps API and Sheets integration
- **Slack Workspace**: For notifications (optional)

## Getting Started

### 1. Install Volta (Recommended)

Volta automatically manages Node.js versions per project:

```bash
# macOS/Linux
curl https://get.volta.sh | bash

# Windows
# Download and install from https://volta.sh
```

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/job-finder.git
cd job-finder
```

### 3. Install Dependencies

```bash
# Install Node.js (Volta will use version from package.json)
volta install node@22.0.4

# Install pnpm globally
volta install pnpm

# Install project dependencies
pnpm install
```

### 4. Environment Configuration

Create `.env` files for each app based on the `.env.example` templates:

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

**Backend** (`apps/backend/.env`):
```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=job-listings
SLACK_WEBHOOK_URL=your-slack-webhook
```

**Worker** (`apps/worker/.env`):
```env
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=job-listings
SLACK_WEBHOOK_URL=your-slack-webhook
GOOGLE_SHEETS_ID=your-sheets-id
```

### 5. Infrastructure Setup

Follow the guides in the `infrastructure/` directory to set up AWS resources:

1. **DynamoDB**: `infrastructure/aws/dynamodb/setup.md`
2. **Lambda**: `infrastructure/aws/lambda/configuration.md`
3. **API Gateway**: `infrastructure/aws/api-gateway/setup.md`

### 6. Run Development Servers

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter frontend dev
pnpm --filter backend dev
pnpm --filter worker dev
```

### 7. Run Storybook (Optional)

```bash
# Start Storybook for component development
pnpm --filter frontend storybook
```

## Available Scripts

### Root Level
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean all build artifacts
- `pnpm typecheck` - Type check all TypeScript code

### Frontend Specific
- `pnpm --filter frontend test:e2e` - Run Playwright E2E tests
- `pnpm --filter frontend test:unit` - Run Jest unit tests
- `pnpm --filter frontend storybook` - Start Storybook server
- `pnpm --filter frontend build-storybook` - Build static Storybook

### Backend Specific
- `pnpm --filter backend deploy` - Deploy backend to AWS
- `pnpm --filter backend logs` - View Lambda logs

### Worker Specific
- `pnpm --filter worker start` - Run scraping task once
- `pnpm --filter worker schedule` - Set up scheduled scraping

## Development Workflow

### Code Style

This project uses ESLint and Prettier for consistent code formatting. Both are configured to run automatically on save in VS Code and Cursor.

### Type Checking

```bash
# Check types across all packages
pnpm typecheck
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @job-finder/shared test

# Run E2E tests
pnpm --filter frontend test:e2e

# Run unit tests
pnpm --filter frontend test:unit
```

### Component Development

Use Storybook for isolated component development:

```bash
pnpm --filter frontend storybook
```

### API Mocking

The project uses MSW (Mock Service Worker) for API mocking during development and testing. Mock handlers are defined in the `mocks/` directory and shared across all apps.

## Deployment

### Frontend (Vercel)

```bash
cd apps/frontend
vercel
```

### Backend (AWS Lambda)

```bash
cd apps/backend
pnpm deploy
```

Follow the deployment guide in `docs/deployment.md` for detailed instructions.

## Architecture

### Data Flow

1. **Worker Layer**: Scheduled scraping tasks collect job listings from various sources
2. **Storage Layer**: Job data is stored in DynamoDB with optimized indexes
3. **API Layer**: Lambda functions provide RESTful endpoints via API Gateway
4. **Presentation Layer**: Next.js frontend displays jobs with filtering, search, and map view
5. **Notification Layer**: New jobs trigger Slack notifications and Sheets updates

### Key Components

- **Scrapers**: Playwright-based scrapers with stealth configuration to avoid detection
- **Job Parser**: Extracts and normalizes job information from various sources
- **Job Repository**: DynamoDB access layer with caching and retry logic
- **API Handlers**: Lambda functions handling search, filtering, and job detail requests
- **Map View**: Google Maps integration for geographic job visualization
- **Filter Panel**: Advanced multi-criteria filtering UI component
- **Slack Integration**: Webhook-based notifications for new job postings
- **Sheets Integration**: Automatic export of job data to Google Sheets

### Architecture Diagram

See `docs/architecture.md` for detailed architecture diagrams and explanations.

## API Documentation

API specifications are available in `docs/api-specification.md`.

### Main Endpoints

- `GET /api/jobs/search` - Search jobs with query parameters
- `GET /api/jobs/filter` - Filter jobs by multiple criteria
- `GET /api/jobs/:id` - Get job details by ID
- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Testing Strategy

- **Unit Tests**: Jest for testing individual functions and components
- **E2E Tests**: Playwright for testing user workflows
- **Component Tests**: Storybook for visual regression testing
- **API Mocking**: MSW for consistent API behavior in tests

## Performance Optimization

- Server Components for improved initial page load
- DynamoDB query optimization with proper indexes
- Lambda function cold start mitigation
- Image optimization with Next.js Image component
- Code splitting and lazy loading

## Security Considerations

- Environment variables for sensitive data
- CORS middleware for API protection
- Rate limiting on Lambda functions
- Input validation and sanitization
- Secure scraping practices (respecting robots.txt)

## Troubleshooting

Common issues and solutions are documented in `docs/setup.md`.

### Common Issues

- **Node version mismatch**: Ensure Volta is installed and run `volta install node@22.0.4`
- **Dependencies not installing**: Clear pnpm cache with `pnpm store prune`
- **Build failures**: Run `pnpm clean` and rebuild
- **Scraping failures**: Check Playwright browser installation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Turborepo](https://turbo.build/)
- Powered by [Next.js](https://nextjs.org/)
- Scraped with [Playwright](https://playwright.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Tested with [Playwright](https://playwright.dev/) and [Jest](https://jestjs.io/)
- Documented with [Storybook](https://storybook.js.org/)

## Support

For questions or issues, please:
- Open an issue on GitHub
- Check the documentation in the `docs/` directory
- Contact the maintainers

---

**Note**: This project is for educational purposes. Always respect robots.txt and terms of service when scraping websites.
# SmartCoupon

SmartCoupon is a Next.js application that leverages Genkit AI for extraction and parsing of coupon data from SMS and natural language search.

## Features

- **SMS Extraction & Parsing**: Extract coupon details from SMS messages using Genkit.
- **Natural Language Search**: Search for coupons using natural language queries.
- **Modern UI**: Built with Radix UI, Tailwind CSS, and Embla Carousel.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js (v18+ recommended) installed.
- **npm/yarn/pnpm**: A package manager for installing dependencies.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd SmartCoupon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`.
   - Update the `GEMINI_API_KEY` in the `.env` file with your own key.
   ```bash
   cp .env.example .env
   ```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:9002`.

### AI Flows

The AI flows are powered by Genkit. You can start the Genkit development environment with:

```bash
npm run genkit:dev
```

## Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## License

This project is private and for internal use.

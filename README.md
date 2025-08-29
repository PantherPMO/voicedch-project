# Voice Curated Archive

The `voice-curated-archive` is a modern, voice-controlled digital museum interface. It is the frontend application for the Digital Cultural Heritage (DCH) monorepo.

## Key Technologies

-   **Framework:** React
-   **Language:** TypeScript
-   **Build Tool:** Vite
-   **UI Library:** shadcn-ui
-   **Styling:** Tailwind CSS
-   **Routing:** React Router DOM
-   **Data Fetching:** Axios

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/)
-   [npm](https://www.npmjs.com/)

### Installation

1.  Navigate to the `voice-curated-archive` directory:
    ```bash
    cd voice-curated-archive
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root of the `voice-curated-archive` directory and add the API base URL.
    ```
    VITE_API_BASE_URL=http://localhost:3000
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).
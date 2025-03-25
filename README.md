# Military Electronic Health Record System

A Vue.js-based Electronic Health Record (EHR) system designed for military healthcare facilities.

## Features

- Patient management (add, edit, view, delete)
- Medical records management
- Dashboard with analytics
- User authentication and role-based access control
- Military service and rank tracking
- Responsive design for desktop and mobile use

## Recent Updates

- **Fixed Patient List Display**: Resolved issues with patient data loading and display in the PatientList component
- **Enhanced Error Handling**: Added better error handling and user feedback
- **Improved UI/UX**: Updated the UI with loading states and better feedback for filtering
- **Unit Tests**: Added comprehensive unit tests for critical components

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:8002
VITE_AUTH_API_URL=http://localhost:8001
```

## Backend Setup

The backend server needs to be running for the application to work properly.

```bash
# Navigate to backend directory
cd ../backend

# Run backend server
python scripts/run_server.py
```

## Testing

### Unit Tests

```bash
# Run unit tests with Jest
npm run test
```

### End-to-End Tests

```bash
# Run end-to-end tests with Playwright
npx playwright test
```

### Regression Tests

```bash
# Run the comprehensive regression test suite
node tests/regression-test.js
```

## Architecture

This application follows a Vue.js-based architecture:

- **Vue 3**: Core framework with Composition API
- **Vue Router**: Client-side routing
- **Vite**: Build tool and development server
- **Custom API Services**: Services for data fetching and business logic
- **Component-Based Design**: Modular components for UI elements

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project maintained by the Military Health Records Team
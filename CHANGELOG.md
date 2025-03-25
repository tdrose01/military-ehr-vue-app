# Changelog

All notable changes to the Military EHR Vue App will be documented in this file.

## [1.0.1] - 2025-03-25

### Fixed
- PatientList component now properly loads and displays patient data
- Fixed loading states in various components for better UX
- Corrected service and rank filter functionality in PatientList view
- Resolved issue with patient selection not working properly
- Fixed styling inconsistencies across different views

### Added
- Unit tests for PatientList component
- Regression tests covering critical application functionality
- Loading indicators with spinners for better user feedback
- Enhanced error handling throughout the application

### Changed
- Improved UI for patient information display
- Enhanced dashboard display of recent patients
- Updated color scheme for better visual hierarchy
- Standardized styling across all main view components
- Ensured consistent capitalization of service and rank fields

### Technical
- Refactored API service calls for better error handling
- Updated computed properties to ensure reactive updates
- Improved template bindings to data properties
- Enhanced development documentation and setup instructions
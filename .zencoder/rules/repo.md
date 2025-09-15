---
description: Repository Information Overview
alwaysApply: true
---

# PTFD (Project Timeline and Financial Dashboard) Information

## Summary
PTFD is a web application for managing construction projects, timelines, and financial dashboards. It includes a chatbot assistant for user support. The application is built with a React frontend and Node.js/Express backend with MongoDB as the database.

## Structure
- **PTFD/**: Main project directory
  - **frontend/**: React-based user interface
  - **Backend/**: Express.js API server
  - **package.json**: Root-level dependencies

## Language & Runtime
**Frontend Language**: JavaScript (React)
**Backend Language**: JavaScript (Node.js)
**React Version**: 19.1.1
**Node.js Framework**: Express 5.1.0
**Database**: MongoDB (Mongoose 8.18.0)
**Package Manager**: npm

## Dependencies

### Frontend Dependencies
**Main Dependencies**:
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.8.2
- axios: ^1.11.0
- bootstrap: ^5.3.7
- aos: ^2.3.4
- lucide-react: ^0.542.0

**Development Dependencies**:
- autoprefixer: ^10.4.21
- postcss: ^8.5.6

### Backend Dependencies
**Main Dependencies**:
- express: ^5.1.0
- mongoose: ^8.18.0
- cors: ^2.8.5
- dotenv: ^16.0.3
- nodemon: ^3.1.10
- axios: ^1.11.0

## Build & Installation

### Frontend
```bash
cd PTFD/frontend
npm install
npm start  # Development server on port 3000
npm run build  # Production build
```

### Backend
```bash
cd PTFD/Backend
npm install
npm start  # Starts server with nodemon on port 5050
```

## Main Components

### Frontend Structure
- **src/Components/**: Main application components
  - **Projects/**: Project management components
  - **Timelines/**: Timeline management components
  - **ProjectTimeline/**: Project timeline integration
  - **FinancialDashboard/**: Financial reporting components
  - **ChatBot/**: AI assistant interface
  - **Home/**: Landing pages
  - **Nav/**: Navigation components

### Backend Structure
- **app.js**: Main entry point and server configuration
- **Controllers/**: Business logic for each feature
- **Model/**: MongoDB schema definitions
- **Route/**: API endpoint definitions

## Database
**Type**: MongoDB Atlas
**Connection**: MongoDB connection string in app.js
**Models**:
- Project
- Timeline
- ProjectTimeline
- FinancialDashboard
- ChatBot

## Testing
**Frontend Framework**: Jest with React Testing Library
**Test Command**:
```bash
cd PTFD/frontend
npm test
```

## Known Issues
- **Font Size Issues**: Small font sizes in various sections of the ConstructionHome component:
  - Introduction to Construction section description
  - Project Showcase description
  - Manage Your Timeline description
  - Other topic descriptions have small font sizes
- **Content Issues**: Lorem ipsum placeholder text needs to be replaced with actual content
- **Video Display**: Videos not displaying properly in the ConstructionHome component
- **Styling Improvements Needed**: Various sections need font size adjustments for better readability
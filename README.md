# Blog Editor with Auto-Save Feature

A modern blog editor application with rich text editing capabilities and automatic draft saving.

## Features

- Rich text editor with comprehensive formatting options
- Automatic draft saving with visual status indicators
- Blog post metadata management (title, description, categories, tags)
- Image embedding and rich media support
- Category and tag management for organized content
- Python backend API for persistent storage
- MySQL database for reliable data persistence
- Draft versioning with recovery options

## Tech Stack

### Frontend
- React.js with TypeScript
- TipTap rich text editor
- Tailwind CSS for styling
- Zustand for state management

### Backend
- Python with Flask
- MySQL database
- RESTful API design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MySQL server

### Installation

1. Clone the repository

2. Install frontend dependencies
```bash
npm install
```

3. Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

4. Configure the database
   - Create a MySQL database named `blog_db`
   - Copy `.env.example` to `.env` and update the database credentials

5. Start the backend server
```bash
cd backend
python app.py
```

6. Start the frontend development server
```bash
npm run dev
```

## Development

### Frontend

The frontend is built with React and uses:
- TipTap for the rich text editor
- Zustand for state management
- Tailwind CSS for styling

### Backend

The backend is built with Python Flask and uses:
- MySQL for database storage
- RESTful API design for data access

## License

This project is licensed under the MIT License - see the LICENSE file for details.

SciTech Labs Management GUI (Flask)

Quick start

1) Optional: create and activate a virtual environment
   python3 -m venv .venv && source .venv/bin/activate

2) Install dependencies
   pip install -r requirements.txt

3) Run the app
   python app.py

4) Open http://127.0.0.1:5000/

Project structure
- app.py: Entrypoint
- labms/: Flask package
  - __init__.py: App factory and blueprint registration
  - routes.py: Routes and in-memory seed data
  - templates/: Jinja2 templates
  - static/: CSS/JS assets

Next steps
- Wire CRUD forms and validation
- Add persistence (SQLite/PostgreSQL) with ORM
- Authentication/authorization (roles: Admin, Faculty, Technician, Student)
- Audit logs and exportable reports
# Cloud Lab Management System (CLMS)

A comprehensive cloud-based laboratory management system designed for multi-campus educational institutions, featuring inventory management, booking systems, and budget tracking capabilities.

## 🚀 Features

- **Multi-Campus Support**: Manage labs across different campuses
- **Inventory Management**: Track equipment, consumables, and maintenance
- **Booking System**: Reserve labs, spaces and equipment with conflict resolution
- **Budget Tracking**: Monitor expenses, allocations, and cost analysis
- **User Management**: Role-based access control (Admin, Lab Manager, Faculty, Student)
- **Reporting & Analytics**: Comprehensive dashboards and reports
- **Cloud-Based**: Accessible from anywhere with secure authentication

## 🏗️ Architecture

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Redis for caching
- **Authentication**: JWT-based with OAuth2 support
- **Cloud**: Docker containerization with Kubernetes deployment

## 📁 Project Structure

```
clms/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── database/          # Database schemas and migrations
├── docs/             # System documentation
├── presentation/      # PowerPoint presentation
├── deployment/        # Docker and Kubernetes configs
└── scripts/          # Utility scripts
```

## 🚀 Quick Start

1. **Clone the repository**
2. **Install dependencies**: `npm install` (both frontend and backend)
3. **Setup database**: Configure PostgreSQL connection
4. **Run the system**: `npm run dev` (both frontend and backend)
5. **Access the application**: http://localhost:3000

## 📚 Documentation

- [System Architecture](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [User Manual](./docs/user-manual.md)
- [Deployment Guide](./docs/deployment.md)

## 🎯 Use Cases

- **Educational Institutions**: Universities, colleges, and schools
- **Research Facilities**: Laboratories and research centers
- **Corporate Labs**: Company research and development facilities
- **Healthcare Facilities**: Medical and clinical laboratories

## 🔒 Security Features

- Role-based access control
- JWT authentication
- API rate limiting
- Data encryption
- Audit logging

## 📊 System Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker 20+
- Kubernetes 1.24+

## 🤝 Contributing

Please read [CONTRIBUTING.md](./docs/contributing.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

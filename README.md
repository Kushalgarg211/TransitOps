# TransitOps 🚚💨
> A Premium Full-Stack Transport & Fleet Operations Management Portal.

TransitOps is a unified management system designed to monitor fleet registries, schedule dispatches, track driver safety records, log fuel expenses, audit maintenance service cycles, and generate operational statements. 

The application utilizes a secure **Role-Based Access Control (RBAC)** architecture that customizes route views and features according to database-authenticated profiles.

---

## 🌟 Key Features

### 👤 Role-Based Portals (RBAC)
*   **Fleet Manager**: Access to the complete transport registry, odometer logs, and active maintenance schedules.
*   **Trip Dispatcher**: Schedule dispatches, check cargo weight constraints, and update the live status boards.
*   **Safety Officer**: Audit driver profiles, track compliance status, verify safety scores, and receive license expiration alerts.
*   **Financial Analyst**: Record fuel fill-ups, log trip tolls, track operational costs, and audit financial trends.
*   **Super User**: Ultimate system administrative keys to access every module and feature concurrently.

### 📈 Smart Diagnostics & Analytics
*   **Dynamic Distance Matrix**: Autocompletes planned distances using a route lookup engine or calculates hash-based values for custom nodes.
*   **CO2 Emission Tracker**: Automatically estimates the fleet's carbon footprint based on liters of fuel consumed (2.68 kg CO2/L).
*   **Custom Date Range Auditing**: Dynamically groups financial records, trend graphs, and cost statistics by chosen billing windows.
*   **One-Click Report Exporter**: Download raw `.csv` datasheets or print formatted PDF operational statements directly.

### 🎨 Theme Customization
*   **Pastel Operations Aesthetic**: Less-rounded borders and soft cards for a clean structure.
*   **Ambient Sidebar**: Rich light-mode warm amber sidebar matching the primary operations design.
*   **Tailwind v4 Dark Mode**: Toggles seamlessly between dark mode styles and light mode templates using a custom root-class variant selector.

---

## 🛠️ Technology Stack
*   **Frontend**: React.js (Vite, Axios, Tailwind CSS v4, Heroicons, Recharts, React Hook Form, TanStack React Query, Hot-Toast).
*   **Backend**: Node.js, Express.js, Sequelize ORM, Express-Validator, JWT Authentication.
*   **Database**: MySQL.

---

## 📂 Project Structure

```
TransitOps/
├── frontend/                  # React Single Page Application (SPA)
│   ├── src/
│   │   ├── components/        # Reusable UI widgets (Sidebar, Topbar)
│   │   ├── contexts/          # Context managers (Auth, Theme)
│   │   ├── layouts/           # Main view frames
│   │   ├── pages/             # Portal pages (Vehicles, Drivers, Trips...)
│   │   ├── routes/            # Route guards (RoleGuard, Router)
│   │   └── services/          # Centralized API service clients
│   └── tailwind.config.js     # Legacy CSS options
├── backend/                   # Express.js REST API
│   ├── config/                # Database and environment configurations
│   ├── controllers/           # Endpoint handlers
│   ├── middleware/            # Security and RBAC filters
│   ├── models/                # Sequelize Database Schemas
│   ├── routes/                # Endpoint bindings
│   ├── seeders/               # DB seeding logic
│   └── validators/            # Express validator schemes
└── README.md                  # System Documentation
```

---

## 🔑 Login Credentials

All users share the password: `password123` (except for the Super User).

| Role | Email Credentials | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Fleet Manager** | `manager@transitops.in` | `password123` | Fleet, Maintenance, Settings |
| **Trip Dispatcher** | `Raven.k@transitops.in` | `password123` | Dashboard, Trips, Settings |
| **Safety Officer** | `safety@transitops.in` | `password123` | Drivers, Maintenance, Settings |
| **Financial Analyst**| `finance@transitops.in` | `password123` | Fuel-Expenses, Reports, Settings |
| **Super User** | `sarthaksahu333@gmail.com`| `vilenop1234` | **ALL FEATURES LUNCHED** |

---

## 🚀 Setup & Launch

### 1. Prerequisites
*   Node.js (v18+)
*   MySQL Server running locally on port 3060/3306

### 2. Database Configuration
Update the `.env` settings inside the `backend/` folder:
```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=vilenop1234
DB_NAME=transitops_db
DB_PORT=3306
JWT_SECRET=transitops_jwt_secret_key_2026_super_secure
PORT=5000
```

### 3. Initialize & Seed Database
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Initialize and seed database tables
npm run seed
```

### 4. Running the Portals

#### Start Backend Dev Server
```bash
# Inside backend/
npm run dev
```

#### Start Frontend Dev Server
```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the portal.

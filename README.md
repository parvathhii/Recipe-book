# Recipe Book — MERN project

A responsive sage-green and cream Recipe Book built with React + Vite, Express, Node.js, and MongoDB Atlas.

## Features
- Add, view, edit, and delete recipes
- Recipe name, category, ingredients, preparation steps, and cooking time
- Search recipes by name or ingredients
- Filter by category
- Form validation and delete confirmation
- Responsive layout
- MongoDB persistence through an Express REST API

## Requirements
- Node.js (LTS recommended)
- npm
- A MongoDB Atlas cluster or local MongoDB

## 1. Install dependencies
Open PowerShell in this project root (`recipe-book-mern`) and run:

```powershell
npm install
npm run install:all
```

## 2. Configure MongoDB
1. In MongoDB Atlas, create a database user and allow your current IP in Network Access.
2. In Atlas, choose **Connect → Drivers → Node.js** and copy the connection string.
3. Copy `backend/.env.example` to `backend/.env`.
4. Put your connection string in `MONGO_URI`. Replace the username/password placeholders. URL-encode special characters in the password.

Example:
```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/recipebook?retryWrites=true&w=majority
```

Never commit your real `.env` file or share your database password. `.gitignore` excludes it.

## 3. Start both apps
From the project root:

```powershell
npm run dev
```

Frontend: http://localhost:5173  
Backend health check: http://localhost:5000/api/health

You can also run them in separate terminals:
```powershell
npm run dev --prefix backend
npm run dev --prefix frontend
```

## API
- `GET /api/recipes` — list recipes
- `GET /api/recipes/:id` — recipe details
- `POST /api/recipes` — create recipe
- `PUT /api/recipes/:id` — update recipe
- `DELETE /api/recipes/:id` — delete recipe

## Troubleshooting
- **`Cannot find module ...server.js`**: make sure you extracted the whole ZIP and opened the `recipe-book-mern` folder. The backend entry file is `backend/server.js`.
- **MongoDB authentication failed**: check database username/password and URL-encode special characters in the password.
- **MongoDB IP/network error**: check Atlas Network Access and add your current IP.
- **Port 5000 already in use**: stop the other process or change `PORT` in `backend/.env` and update the frontend API URL if necessary.
- **Frontend says it cannot reach API**: confirm the backend is running and check `VITE_API_URL` in `frontend/.env`.

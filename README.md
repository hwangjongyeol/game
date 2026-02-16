# AutoGame Monorepo

## Structure
- `backend`: Spring Boot API + JPA
- `frontend`: React + Phaser client
- `docs`: architecture/API/design docs

## Run Backend
```bash
cd backend
./gradlew bootRun
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api` to `http://localhost:8080`.
# game

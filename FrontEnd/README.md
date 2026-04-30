# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

Deployment notes

- **API base URL:** The frontend reads the backend URL from the Vite env variable `VITE_API_URL`. See `.env.example` for the expected name.
- **Vercel:** This project includes `vercel.json` to build the frontend as a static site. On Vercel set the environment variable `VITE_API_URL` (Project Settings → Environment Variables) to your backend URL (for example `https://api.example.com`).

Commands (local):

```bash
cd FrontEnd
npm install
npm run build
npm run preview
```

For deployment to Vercel, point a Vercel project to the `FrontEnd` folder or create a separate project and add `VITE_API_URL` in Vercel's environment variables.

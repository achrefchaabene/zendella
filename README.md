# Zendella

Boutique e-commerce d'accessoires maison avec paiement à la livraison et livraison estimée sous 8 jours.

## Démarrage local

1. Copiez `server/.env.example` vers `server/.env` puis complétez les variables.
2. Copiez `client/.env.example` vers `client/.env`.
3. Lancez `npm install`, puis `npm run dev`.

Le client est servi sur `http://localhost:5173`, l'API sur `http://localhost:5000`.

## Déploiement

### Render (API)

- Créez un *Web Service* depuis ce dépôt.
- Root directory : `server`
- Build command : `npm install`
- Start command : `npm start`
- Ajoutez les variables de `server/.env.example` dans Render. Ajoutez l'URL Vercel finale dans `CLIENT_URL`.

### Vercel (client)

- Importez ce dépôt et définissez le root directory sur `client`.
- Framework : Vite ; build command `npm run build` ; output `dist`.
- Ajoutez `VITE_API_URL=https://votre-api.onrender.com/api`.

Ne placez jamais `MONGODB_URI`, le secret JWT ni le secret Cloudinary dans le client ou dans Git.

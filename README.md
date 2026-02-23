# ARCHISPACE — Site Web

Site one-page premium pour l'agence Archispace, développé en HTML/CSS/JS pur.

## Structure des fichiers

```
archispace/
├── index.html      ← Structure HTML (4 sections + chatbot)
├── style.css       ← Design system noir & blanc, responsive
├── script.js       ← Navigation, animations, chatbot, formulaire
├── hero.png        ← Image hero (accueil)
├── proj1.png       ← Penthouse Lumière Noire
├── proj2.png       ← Villa Horizon
├── proj3.png       ← Loft Atelier 11
├── proj4.png       ← Siège Social Nova Tech
├── proj5.png       ← Concept Store Obsidian
└── README.md
```

## Lancement local

Double-cliquer sur `index.html` **ou** utiliser un serveur local :

```bash
# Python 3
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080
```

---

## Intégration du Chatbot n8n

### 1. Créer le workflow n8n

1. Dans n8n, créez un nouveau workflow
2. Ajoutez un nœud **Webhook** :
   - Method : `POST`
   - Path : `archispace-chat` (ou ce que vous souhaitez)
   - Response Mode : `Last Node`
3. Connectez un nœud **AI Agent** (OpenAI, Anthropic, etc.) :
   - System prompt suggéré :
     ```
     Tu es l'assistant commercial d'Archispace, agence d'architecture et 
     design d'intérieur parisienne fondée en 2018. Ton rôle est d'accueillir 
     les visiteurs, répondre à leurs questions sur l'agence, et les 
     encourager à prendre contact. Ton ton est professionnel, chaleureux 
     et premium. Réponds toujours en français. Sois concis (2-3 phrases max).
     ```
   - Input : `{{ $json.body.message }}`
4. Connectez un nœud **Respond to Webhook** :
   - Body : `{ "reply": "{{ $json.text }}" }`
5. Activez et copiez l'URL du webhook

### 2. Configurer script.js

Ouvrez `script.js` et remplacez :

```js
webhookUrl: 'REMPLACER_PAR_VOTRE_WEBHOOK_N8N',
```

Par votre URL :

```js
webhookUrl: 'https://votre-instance.n8n.cloud/webhook/archispace-chat',
```

### 3. CORS (si nécessaire)

Si votre site est hébergé sur un domaine différent de n8n, configurez les 
en-têtes CORS dans le nœud Webhook n8n :

- `Access-Control-Allow-Origin: https://votre-domaine.com`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

---

## Format d'échange API

**Requête envoyée par le chatbot :**
```json
{
  "message": "Bonjour, quel est votre délai de livraison ?",
  "source": "archispace-website"
}
```

**Réponse attendue de n8n :**
```json
{ "reply": "Votre réponse ici..." }
```
*(Les clés `message` et `response` sont aussi acceptées.)*

---

## Déploiement

Le site est 100% statique — compatible avec tout hébergeur :

| Hébergeur | Commande / Méthode |
|-----------|-------------------|
| **Netlify** | Glisser-déposer le dossier sur [netlify.com](https://netlify.com) |
| **Vercel** | `vercel --prod` depuis le dossier |
| **GitHub Pages** | Push sur branche `gh-pages` |
| **OVH / cPanel** | Upload FTP à la racine `public_html/` |

---

## Personnalisation rapide

| Élément | Fichier | Ligne / Sélecteur |
|---------|---------|-------------------|
| URL webhook | `script.js` | `CONFIG.webhookUrl` |
| Adresse / tel / email | `index.html` | Section `#contact` |
| Messages d'accueil chatbot | `script.js` | `CONFIG.welcomeMessages` |
| Couleurs | `style.css` | `:root` variables |
| Polices | `index.html` | `<link>` Google Fonts + `style.css` `--font-*` |

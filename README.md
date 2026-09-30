# Smart Home Break-In Mystery – Netlify app
Student app: `/`   Host dashboard: `/host.html` (PIN = env var HOST_PIN, default `iot2026`)

## Deploy
1. `npm install`
2. `npx netlify-cli login` then `npx netlify-cli deploy --prod` (create a new site when asked)
   (or push this folder to GitHub and import it in Netlify – functions + Blobs are picked up automatically)
3. Netlify → Site settings → Environment variables → add `HOST_PIN` with your own PIN, then redeploy.

Marking is done on the server (netlify/functions/api.mjs): Sensors 40, Cost 10, Rule 15, Attack response 35 = 100.

# Kiosk Backend

Sometimes you may need to enable the google sheets api. https://console.developers.google.com/apis/api/sheets.googleapis.com/overview

## Develop

Create the dotenv as shown below. 

- `npm i` or `yarn i` or `pnpm i`
- `npm run dev` or `yarn dev` or `pnpm dev`

## Deploy

Deployment is done with docker. Please install docker first.

## Dotenv

```toml
# /.env
SHEET_ID=
SERVICE_EMAIL=
SERVICE_KEY="Key needs to be inside of quotes"
```
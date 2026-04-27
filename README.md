# Asset Connector API

Lekki konektor API dla agenta AI. Agent może sam zdecydować, czy potrzebuje assetu, ale używa wyłącznie zasobów zwróconych przez ten serwis.

## Funkcje

- `POST /v1/assets/search` - wyszukiwanie assetów u providerów.
- `POST /v1/assets/validate` - walidacja użycia assetu dla konkretnego kontekstu.
- `POST /v1/assets/download` - pobranie informacji o bezpiecznym URL-u do użycia/pobrania.
- `POST /v1/assets/usage` - zapis użycia assetu do logu audytowego.
- `GET /v1/providers` - lista aktywnych providerów.

## Uruchomienie

Wymagany Node.js 18+.

```bash
cp .env.example .env
npm start
```

Bez kluczy API endpointy działają, ale providerzy nie zwrócą wyników. Ustaw co najmniej jeden klucz:

- `PEXELS_API_KEY`
- `PIXABAY_API_KEY`
- `FREEPIK_API_KEY`
- `ICONFINDER_API_KEY`

## Przykład dla agenta

```bash
curl -X POST http://localhost:8787/v1/assets/search \
  -H 'content-type: application/json' \
  -d '{
    "query": "premium coffee shop interior",
    "assetType": "photo",
    "usage": "commercial_website",
    "requireNoAttribution": true,
    "limit": 8
  }'
```

## Zasada bezpieczeństwa

Agent nie interpretuje sam licencji. Konektor normalizuje providerów do wspólnego modelu:

```json
{
  "commercialAllowed": true,
  "attributionRequired": false,
  "rawRedistributionAllowed": false,
  "editorialOnly": false
}
```

W produkcji warto podmienić `src/usage-store.js` na bazę danych i dopiąć własne uwierzytelnianie.

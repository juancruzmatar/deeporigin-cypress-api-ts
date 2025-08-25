# Deep Origin – API Tests (Cypress + TypeScript)

API tests for the **DummyJSON Products** API using **Cypress 13 + TypeScript**.

## Getting Started

```bash
# Node 18+ recommended
npm install
npm test        # headless run
npm run test:open  # interactive mode
npm run lint:types # type-check
```

## Project Structure

```
.
├─ cypress.config.ts
├─ tsconfig.json
├─ package.json
└─ cypress
   ├─ e2e
   │  └─ api
   │     └─ products.spec.ts
   └─ support
      └─ e2e.ts
```

## Notes

- Uses `cy.request` via a small custom command `cy.api(method, url, body?)`.
- Covers: list, pagination (`limit`, `skip`), field selection (`select`), sorting, single product,
  search, categories, category list, by-category query, and simulated **POST/PUT/PATCH/DELETE**.
- Includes a simple negative test.
- Videos disabled for faster CI; enable in `cypress.config.ts` if needed.
- Base URL is configured to `https://dummyjson.com`.

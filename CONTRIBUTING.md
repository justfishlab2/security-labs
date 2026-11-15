# Contributing

Useful contributions are small, explainable, and reproducible: clearer documentation, corrected assumptions, stronger regression tests, or an isolated new synthetic lab.

1. Open an issue first for a substantial new experiment. Do not include private findings or credentials.
2. Keep lab servers bound to loopback and use synthetic identities/data only.
3. Distinguish intentionally vulnerable behavior from the relevant mitigation.
4. Add tests for both legitimate and denied behavior; explain limitations.
5. Run `npm test` and `npm run lab:001` on Node.js 22 or newer.
6. Keep generated artifacts and personal environment details out of commits.
7. Use `docs/LAB-TEMPLATE.md` for new lab documentation.

Do not add real-target exploitation, mass scanning, private user records, telemetry, secret values, or claimed results that cannot be substantiated. New runtime dependencies should have a specific justification; the current lab needs none.

This repository follows the same authorization boundaries described in its README. MIT-licensed contributions should be your own work or appropriately permissioned and credited.

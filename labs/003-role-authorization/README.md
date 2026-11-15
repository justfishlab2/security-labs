# Lab 003 / Role-based authorization

**Question:** can an ordinary member directly call an admin export function?

This owned local experiment uses a synthetic export response and mock identities. It is not a bounty finding.

## Run

From the repository root, on Node.js 22 or newer:

```sh
npm test
npm run lab:policies
```

Implementation: [`../policy-server.mjs`](../policy-server.mjs). The temporary server binds only to `127.0.0.1`; the runner writes `artifacts/policy-labs.json` and exits. Original owned-VPS capture: [`../../evidence/policy-vps.json`](../../evidence/policy-vps.json).

## Expected policy

The fixture maps `account-a` to member and `account-admin` to admin. Both request `/role/{mode}/reports/export`.

| Mode | Actor | HTTP |
| --- | --- | --- |
| Unprotected | member | 200 |
| Unprotected | admin | 200 |
| Protected | member | 403 |
| Protected | admin | 200 |

An additional test verifies that `X-Role: admin` from a member does not elevate that mock identity.

## Mitigation and limits

Enforce role decisions at each sensitive server-side function; hiding a button does not authorize an endpoint. Production identity and roles must come from a verified session/token, with explicit policy for tenant boundaries and delegation.

The mock `X-Lab-User` can still be changed to select an admin. This is intentionally not a real authentication system. No real export, token lifecycle, inherited roles, delegation, or database privilege escalation is modeled. Do not expose the fixture publicly.

[Case study](https://justfishlab.my.id/notes/role-authorization) · [Shared regression tests](../policy-labs.test.mjs)

# Lab 002 / Tenant isolation

**Question:** can a member of tenant B read a project belonging to tenant A?

This is a local synthetic lab, not a vulnerability report against a public target.

## Run

From the repository root, on Node.js 22 or newer:

```sh
npm test
npm run lab:policies
```

The shared implementation is [`../policy-server.mjs`](../policy-server.mjs). The runner binds a random IPv4 loopback port, performs local requests, writes `artifacts/policy-labs.json`, and exits. The original owned-VPS capture is [`../../evidence/policy-vps.json`](../../evidence/policy-vps.json).

## Fixture and expected policy

`account-a` and `account-admin` map to `tenant-a`; `account-b` maps to `tenant-b`. Project `record-a` belongs to `tenant-a`.

| Mode | Actor | HTTP |
| --- | --- | --- |
| Unprotected | account-a | 200 |
| Unprotected | account-b | 200 |
| Protected | account-a | 200 |
| Protected | account-b | 403 |

The tests also preserve same-tenant admin access and reject a client-supplied `X-Tenant` override.

## Mitigation and limits

Derive tenant membership from verified identity, enforce tenant scoping in data access, and add cross-tenant tests for reads and writes. Do not trust an arbitrary tenant header.

`X-Lab-User` is still a client-controlled mock identity, not real authentication. This fixture does not model invitations, tenant switching, cross-tenant administrators, shared caching, search, background jobs, or a real database. Do not deploy it publicly.

[Case study](https://justfishlab.my.id/notes/tenant-isolation) · [Shared regression tests](../policy-labs.test.mjs)

---
title: "cks-runtime"
description: "cks-runtime"
---

> The canonical operational environment for Canonical Knowledge Structures.

`cks-runtime` provides the infrastructure to execute, manage, version, persist, and expose Canonical Knowledge Structures without becoming a semantic authority itself. Fully async, with PostgreSQL support alongside SQLite. Currently at **v1.49.2**.

## Why Runtime?

Canonical knowledge is immutable. Operational state is not.

`cks-runtime` gives you:

- **Sessions** — isolated execution contexts for knowledge structures.
- **Transactions** — atomic units of work with commit, rollback, and abort.
- **Version History** — every successful transaction creates an immutable snapshot.
- **Time-Travel Operations** — list versions, compare them with `diff`, and safely revert to any previous state.
- **Event System** — lifecycle events published via `EventBus` for reactive architectures.
- **Distributed replication** — gossip-based multi-node sync with a CRDT storage layer underneath.
- **Autonomous background agents** — sweepers that detect (never silently fix) contradictions, staleness, and graph health issues.

## Key Features

| Feature | Description |
|---------|-------------|
| Session Manager | Create, retrieve, and close isolated runtime sessions. |
| Transaction Manager | Begin, commit, rollback, and abort transactions. |
| Version Manager | Create, retrieve, and list immutable runtime versions. |
| Storage Abstraction | Pluggable storage backends (in-memory, SQLite, PostgreSQL with pgvector). |
| Execution Engine | Canonical operations (Validate, Serialize, Explain, Evolve, Diff) via `CoreBridge`. |
| EventBus | Publish and subscribe to `TransactionCommitted`, `VersionCreated`, and other lifecycle events. |
| Plugin Architecture | Replaceable storage, core, and operation implementations via `CoreInterface`. |
| **Gossip Replication** (ADR-008) | Peer-to-peer session exchange — HMAC-signed envelopes, replay protection, peer discovery, weighted peer selection, background anti-entropy service. |
| **CRDT Adapter** (ADR-013) | Conflict-free replicated storage beneath gossip — grow-only set with a Merkle prefix tree, MV-Register with causal ordering and fork detection, quarantine validation on every incoming merge. |
| **Autonomous Sweepers** | Seven background, detection-only sweepers — contradiction, inference/provenance/temporal staleness, graph freshness, auto-update, and health — that escalate findings into a persistent outbox rather than acting unilaterally. |
| **Agent Infrastructure** | Liveness tracking and stop signalling (ADR-016) for external standalone agents (Critic, Enrichment, Fork Resolution, Pipeline); remote sweeper start/stop control (ADR-015). |
| **Graph Registry** | `register_graph`/`get_graph`/`list_graphs` — the storage foundation for `cks-mcp`'s Memory Agent and `cks-studio`'s Graph Gallery. |
| **Backup & Disaster Recovery** (ADR-012) | `export_storage()`/`import_storage()` across every backend for full data dumps and clear/merge restores. |

## Quick Example

```python
from cks_runtime import Runtime
from cks_runtime_plugins.cks_core import CksCoreAdapter
from cks_runtime.operations.operation_types import ValidateOperation

runtime = Runtime(core=CksCoreAdapter())

session = runtime.create_session({"example": True})
tx = runtime.begin_transaction(session)
tx.add_operation(ValidateOperation("v1", knowledge_structure=session.knowledge_structure))
version = runtime.commit_transaction(tx)
print(version.version_id)
```

## Learn More

- [Runtime Charter](charter/CHARTER.md)
- [Architecture](architecture/ARCH-001_Runtime_Architecture.md)
- [Specifications](standards/runtime/SPEC-001_Runtime_Overview.md)
- [Architecture Decision Records](adr/ADR-001%20Runtime%20Layering.md) — including gossip (ADR-008), CRDT (ADR-013), sweeper control (ADR-015), and agent process control (ADR-016)

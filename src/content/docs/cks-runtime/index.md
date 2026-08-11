# cks-runtime

> The canonical operational environment for Canonical Knowledge Structures.

`cks-runtime` provides the infrastructure to execute, manage, version, persist, and expose Canonical Knowledge Structures without becoming a semantic authority itself.

## Why Runtime?

Canonical knowledge is immutable. Operational state is not.

`cks-runtime` gives you:

- **Sessions** — isolated execution contexts for knowledge structures.
- **Transactions** — atomic units of work with commit, rollback, and abort.
- **Version History** — every successful transaction creates an immutable snapshot.
- **Time-Travel Operations** — list versions, compare them with `diff`, and safely revert to any previous state.
- **Event System** — lifecycle events published via `EventBus` for reactive architectures.

## Key Features

| Feature | Description |
|---------|-------------|
| Session Manager | Create, retrieve, and close isolated runtime sessions. |
| Transaction Manager | Begin, commit, rollback, and abort transactions. |
| Version Manager | Create, retrieve, and list immutable runtime versions. |
| Storage Abstraction | Pluggable storage backends (in-memory, SQLite, PostgreSQL). |
| Execution Engine | Canonical operations (Validate, Serialize, Explain, Evolve, Diff) via `CoreBridge`. |
| EventBus | Publish and subscribe to `TransactionCommitted`, `VersionCreated`, and other lifecycle events. |
| Plugin Architecture | Replaceable storage, core, and operation implementations via `CoreInterface`. |

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

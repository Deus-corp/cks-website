# Case Study: Catching Fake Citations

**Problem:** LLMs can produce plausible-looking citations that reference
non-existent papers, authors, or URLs. Prompt-based solutions ask the
model nicely not to hallucinate — but don't enforce anything.

**CKS solution:** Every `VerificationRecord` must carry a cryptographic
signature produced by `verify_source`, which performs a real HTTP request.
A hand-written record with a fake signature is mechanically rejected,
even if the model never calls `verify_source` itself.

---

## Scenario

We asked Claude (Haiku 4.5) to validate a knowledge structure containing:

- A claim: *"Dark matter consists of WIMPs"*
- A document: *"Dr. Elena Marchetti (2024) proved..."* (fabricated)
- A `VerificationRecord` with a fake signature `"garbage_signature_12345"`
- A `verified_by` relation linking the document to the record

---

## Tools Used

- `validate_knowledge` with extension `verification_record`
- `evolve_knowledge` (attempted injection of the fake record)
- `serialize_knowledge` (to confirm the record was NOT persisted)

---

## What Happened

1. **Direct injection via `evolve_knowledge`** — rejected with error:
   ```
   CKS-MCP-UNVERIFIED-PROVENANCE: VerificationRecord 'vr-fake' does not
   carry a valid provenance signature.
   ```
   The commit was blocked entirely. No version was created.

2. **Validation via `validate_knowledge`** — returned `valid: false`,
   no `session_id`, and the fake record was never persisted.

3. **Serialization attempt** — impossible, because the session was
   never created for the rejected structure.

---

## Key Takeaways

- CKS doesn't *ask* the model to be honest — it *prevents* dishonesty
  at the structural level.
- A fake citation cannot sneak in through evolution, merging, or
  direct validation.
- The check is unconditional: even if the model "forgets" to opt into
  the verification extension, the signature is verified.
- This works with **any** LLM that supports MCP tools — not just Claude.

---

## Reproduce It Yourself

1. Install `cks-mcp` and connect it to Claude Desktop.
2. Start a chat and say:  
   `Use cks-mcp to validate this claim with source verification: "Dark matter is WIMPs. Source: Dr. Fake (2024)."`
3. Observe the error: `CKS-MCP-UNVERIFIED-PROVENANCE`.

No coding required.

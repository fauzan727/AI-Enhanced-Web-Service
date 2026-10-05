# AI Development Log

Illustrative development prompt examples for the Saga Studio chat assistant; these are examples, not a transcript of actual development messages.

1. **Accepted:** “Use Express and Zod to validate an alternating user/assistant conversation, inject studio knowledge into a Claude 3.5 Sonnet Bedrock request, and test the API with a fake model client.”  
   **Reason:** Matches the API contract while keeping tests deterministic and independent of AWS billing.

2. **Rejected:** “Log every chat request and Bedrock response to simplify debugging.”  
   **Architectural reason:** Conversations can contain personal or confidential information. Application code must not write chat content to console or log files; errors returned to clients are sanitized.

3. **Accepted with limitation:** “Return an ID when a lead is submitted, even before a database is selected.”  
   **Reason/limitation:** A UUID fulfills the response contract, but it is not durable storage. Documentation explicitly states that lead persistence and retention require a later approved backend.

### Rule: DTOs and Mappers

- All external boundaries (API responses, client hooks) use DTOs.
- Use domain mappers (for example, `CategoryMapper.ts`) to convert between Entities/Models and DTOs.
- Keep DTOs stable; version if you must break compatibility.

Constraints
- No UI-specific fields in DTOs; compose in the client.
- Do not leak persistence identifiers that are not part of the contract.


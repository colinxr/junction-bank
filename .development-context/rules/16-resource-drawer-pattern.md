### Rule: Resource Drawer Pattern

- Use `components/layout/ResourceDrawer.tsx` for row-detail drawers.
- Resource-specific content components live in each feature directory (for example, `app/dashboard/transactions/components/TransactionDrawerContent.tsx`).
- Data tables open the drawer on row click and pass the selected resource to the drawer via props.

Constraints
- Keep drawer content focused on read-first details and core actions (edit/delete).
- Maintain type safety via shared props interfaces.


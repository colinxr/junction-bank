### **TDD Implementation Plan (Step-by-Step with Atomic Commits)**  
Each step follows **Red → Green → Refactor** with passing tests before moving forward.  

---

### **Step 1: Define `CoreTransaction` (Test First)**  
**Commit Title**: `test(transactions): Add failing test for CoreTransaction`  
1. **Red**: Create failing test for `CoreTransaction` validation:  
   ```typescript
   // domains/Transactions/types.test.ts
   it("rejects transactions without amountCAD or amountUSD", () => {
     const invalidTx = { clerkId: "1", name: "Test" } as CoreTransaction;
     expect(() => validateCoreTransaction(invalidTx)).toThrow();
   });
   ```  
2. **Green**: Implement `CoreTransaction` and validator:  
   ```typescript
   // domains/Transactions/types.ts
   export function validateCoreTransaction(tx: Partial<CoreTransaction>): asserts tx is CoreTransaction {
     if (!tx.amountCAD && !tx.amountUSD) throw new Error("Either amountCAD or amountUSD must be provided");
   }
   ```  
3. **Refactor**: Extract validation logic to `transactionValidators.ts`.  

---

### **Step 2: Align `TransactionDTO` with `CoreTransaction`**  
**Commit Title**: `refactor(transactions): Update TransactionDTO to extend CoreTransaction`  
1. **Red**: Update `TransactionDTO` test to expect `notes: string | undefined`:  
   ```typescript
   // domains/Transactions/TransactionDTO.test.ts
   it("returns undefined for notes if null in DB", () => {
     const dbTx = { notes: null } as Transaction;
     expect(toTransactionDTO(dbTx).notes).toBeUndefined();
   });
   ```  
2. **Green**: Modify `TransactionDTO`:  
   ```typescript
   // domains/Transactions/TransactionDTO.ts
   export interface TransactionDTO extends Omit<CoreTransaction, "notes"> {
     notes?: string; // Convert DB null → undefined
   }
   ```  
3. **Refactor**: Add mapper utility `toTransactionDTO`.  

---

### **Step 3: Implement USD-to-CAD Conversion (TDD)**  
**Commit Title**: `feat(transactions): Add CurrencyService integration`  
1. **Red**: Test USD-only import:  
   ```typescript
   // domains/Transactions/services/currency.test.ts
   it("converts USD to CAD", async () => {
     mockConvertUSDToCAD.mockResolvedValue(100);
     const result = await ensureAmountCAD({ amountUSD: 75 });
     expect(result.amountCAD).toBe(100);
   });
   ```  
2. **Green**: Implement `ensureAmountCAD`:  
   ```typescript
   // domains/Transactions/services/currency.ts
   export async function ensureAmountCAD(dto: TransactionImportDTO): Promise<CoreTransaction> {
     if (!dto.amountCAD && !dto.amountUSD) throw new Error("Missing amounts");
     return {
       ...dto,
       amountCAD: dto.amountCAD ?? await CurrencyService.convertUSDToCAD(dto.amountUSD!),
     };
   }
   ```  
3. **Refactor**: Extract mock setup to `beforeEach`.  

---

### **Step 4: Update API Adapters (TDD)**  
**Commit Title**: `test(api): Add adapter tests for ISO date parsing`  
1. **Red**: Test ISO date handling:  
   ```typescript
   // infrastructure/api/adapters/transactions.test.ts
   it("parses ISO date strings", () => {
     const result = toCoreTransaction({ date: "2025-01-01" });
     expect(result.date).toBeInstanceOf(Date);
   });
   ```  
2. **Green**: Implement adapter:  
   ```typescript
   // infrastructure/api/adapters/transactions.ts
   export function toCoreTransaction(dto: TransactionCreateDTO): CoreTransaction {
     return { ...dto, date: new Date(dto.date) };
   }
   ```  
3. **Refactor**: Add error handling for invalid dates.  

---

### **Step 5: Refactor Tests to Remove Type Casting**  
**Commit Title**: `test(transactions): Replace type casting with factories`  
1. **Red**: Identify tests using `as`:  
   ```typescript
   // domains/Transactions/Actions/store.test.ts
   const tx = { amountCAD: 100 } as Transaction; // Remove this
   ```  
2. **Green**: Add factory:  
   ```typescript
   // test/factories/transactions.ts
   export const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
     amountCAD: 100,
     ...overrides,
   });
   ```  
3. **Refactor**: Update all tests to use factories.  

---

### **Step 6: Document Changes**  
**Commit Title**: `docs: Add ADR for type system changes`  
1. **Red**: Create empty ADR:  
   ```markdown
   .development-context/ADRs/94-transaction-types.md  
   ```  
2. **Green**: Document decisions:  
   ```markdown
   # 002: Unified Transaction Type System  
   - **Decision**: Use `CoreTransaction` as source of truth.  
   - **Rules**:  
     - `amountCAD` required post-conversion.  
     - `notes` is `null` in DB, `undefined` in API.  
   ```  
3. **Refactor**: Link to issue #94.  

---

### **Verification Plan**  
1. **Pre-Commit Hook**: Runs `npm test` to ensure green tests.  
---

### **Example PR Timeline**  
1. **Day 1**: Commits 1–2 (Core types + DTOs).  
2. **Day 2**: Commits 3–4 (Currency + API).  
3. **Day 3**: Commits 5–6 (Tests + docs).  

Each PR merges only when:  
- ✅ Tests pass.  
- ✅ Coverage ≥ 90%.  
- ✅ ADR reviewed.  

Let me know if you'd like to adjust the TDD granularity or add specific test cases.
export function cleanUpdateData<T extends Record<string, any>>(
  data: T,
  transformers: Partial<Record<keyof T, (value: any) => any>> = {}
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      const transformer = transformers[key as keyof T];
      result[key as keyof T] = transformer ? transformer(value) : value;
    }
  }
  
  return result;
}

// templates/client-base/src/lib/schema-validator.ts

/**
 * Recursively remove null and undefined values from an object
 * This ensures Schema.org JSON-LD is valid
 */
export function cleanStructuredData(data: any): any {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (Array.isArray(data)) {
    return data
      .map(item => cleanStructuredData(item))
      .filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const key in data) {
      const value = cleanStructuredData(data[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  return data;
}

/**
 * Validate and clean a Schema.org object before emitting
 */
export function validateSchemaObject(schema: any): any {
  if (!schema || typeof schema !== 'object') {
    return null;
  }

  // Ensure @context and @type are present for top-level schemas
  if (!schema['@context'] && !schema['@graph']) {
    return null;
  }

  return cleanStructuredData(schema);
}


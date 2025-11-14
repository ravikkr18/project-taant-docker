// Helper functions to handle variant options in JSON format

export interface VariantOption {
  name: string;
  value: string;
}

/**
 * Validate that options array doesn't exceed the maximum (can be extended as needed)
 */
export function validateOptionsCount(options: VariantOption[]): { isValid: boolean; error?: string } {
  if (options.length > 10) {
    return {
      isValid: false,
      error: 'Maximum 10 variant options allowed'
    };
  }

  // Check for duplicate names
  const names = options.map(opt => opt.name.toLowerCase());
  const uniqueNames = new Set(names);
  if (names.length !== uniqueNames.size) {
    return {
      isValid: false,
      error: 'Variant option names must be unique'
    };
  }

  return { isValid: true };
}

/**
 * Transform database variant result to include options array in the expected format
 */
export function transformVariantData(variant: any): any {
  const transformedVariant = { ...variant };

  // Use the JSON options directly from database
  if (variant.options && Array.isArray(variant.options)) {
    transformedVariant.options = variant.options;
  } else {
    transformedVariant.options = [];
  }

  // Remove all old option columns from the response
  delete transformedVariant.option1_name;
  delete transformedVariant.option1_value;
  delete transformedVariant.option2_name;
  delete transformedVariant.option2_value;
  delete transformedVariant.option3_name;
  delete transformedVariant.option3_value;

  return transformedVariant;
}

/**
 * Transform an array of variant database results
 */
export function transformVariantsArray(variants: any[]): any[] {
  return variants.map(transformVariantData);
}
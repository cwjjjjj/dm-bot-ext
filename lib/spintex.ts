/**
 * Spintex Parser - Message template parsing with variable substitution and randomization
 * Supports:
 * - Variable substitution: {Name}, {Category}, {CustomField}
 * - Spintex syntax: {Hi|Hello|Hey} (randomly selects one)
 * - Nested spintex: {Hi {there|there!}|Hello|Hey}
 */

/**
 * Parse and resolve spintex format: {Hi|Hello|Hey}
 * Supports nested spinning: {Hi {there|there!}|Hello|Hey}
 */
export function parseSpintex(text: string): string {
  // Recursively resolve all spintex patterns
  let result = text;
  let maxIterations = 100; // Prevent infinite loops
  let iterations = 0;

  while (result.includes('{') && result.includes('}') && iterations < maxIterations) {
    // Find innermost spintex pattern
    const pattern = /\{([^{}]+)\}/g;
    let hasMatch = false;

    result = result.replace(pattern, (_, options) => {
      hasMatch = true;
      const choices = options.split('|');
      return choices[Math.floor(Math.random() * choices.length)];
    });

    if (!hasMatch) break;
    iterations++;
  }

  return result;
}

/**
 * Parse message with variable substitution and spintex resolution
 * Variables: {Name}, {Category}, {CustomField}
 *
 * Example:
 * parseMessage("Hi {Name}! {I love your|I really enjoy your} {Category} content.", {
 *   Name: "John",
 *   Category: "Fashion"
 * })
 * // Returns: "Hi John! I really enjoy your Fashion content."
 */
export function parseMessage(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  // First substitute variables (case-insensitive)
  Object.entries(variables).forEach(([key, value]) => {
    // Case-insensitive regex match for {variable} or {Variable}
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, value || '');
  });

  // Then resolve spintex
  result = parseSpintex(result);

  return result.trim();
}

/**
 * Validate spintex syntax
 * Checks for matching braces
 */
export function validateSpintex(text: string): {
  valid: boolean;
  error?: string;
} {
  let openBraces = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      openBraces++;
    } else if (text[i] === '}') {
      openBraces--;
      if (openBraces < 0) {
        return { valid: false, error: 'Closing brace without opening brace' };
      }
    }
  }

  if (openBraces > 0) {
    return { valid: false, error: 'Unclosed spintex brace' };
  }

  // Check for empty spintex patterns {}
  if (/\{\s*\}/.test(text)) {
    return { valid: false, error: 'Empty spintex pattern' };
  }

  // Check for spintex patterns without options
  if (/\{[^|]*\}/.test(text)) {
    const hasValidSpintex = /\{[^|]*\|[^}]*\}/.test(text);
    const hasVariables = /\{[A-Za-z][A-Za-z0-9]*\}/.test(text);

    // If it has braces but no valid spintex or variables, it might be an error
    if (!hasValidSpintex && !hasVariables) {
      return { valid: false, error: 'Invalid spintex pattern (missing | separator)' };
    }
  }

  return { valid: true };
}

/**
 * Extract variable names from template
 * Returns all {variable} placeholders (case-insensitive)
 */
export function extractVariables(template: string): string[] {
  const variablePattern = /\{([A-Za-z][A-Za-z0-9]*)\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = variablePattern.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Preview message with sample variables
 * Useful for showing users what their message will look like
 */
export function previewMessage(
  template: string,
  customVariables?: Record<string, string>
): string {
  const defaultVariables = {
    Name: 'John',
    Category: 'Fashion',
    ...customVariables,
  };

  return parseMessage(template, defaultVariables);
}

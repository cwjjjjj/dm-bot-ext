/**
 * CSV Parser for Instagram contact lists
 * Intelligently handles various Instagram URL formats
 */

import Papa from 'papaparse';
import type { Contact } from '~/types/storage';

/**
 * Parsed contact from CSV
 */
export interface ParsedContact {
  profileLink: string; // Required column
  name?: string;
  category?: string;
  [key: string]: string | undefined;
}

/**
 * Import error
 */
export interface ImportError {
  row: number;
  error: string;
  data: any;
}

/**
 * Parse CSV file and extract contacts
 * Handles both full URLs (https://www.instagram.com/username/)
 * and plain usernames
 */
export async function parseCSV(file: File): Promise<{
  contacts: ParsedContact[];
  errors: ImportError[];
}> {
  return new Promise((resolve) => {
    const errors: ImportError[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const contacts: ParsedContact[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            // Support various column names
            const profileLink =
              row['Profile Link'] ||
              row['profileLink'] ||
              row['profile_link'] ||
              row['profile'] ||
              row['Profile'];

            if (!profileLink) {
              errors.push({
                row: index + 2, // +2 because header is row 1, 0-indexed
                error: 'Missing Profile Link column',
                data: row,
              });
              return;
            }

            // Normalize the profile link
            const normalized = normalizeProfileLink(profileLink);

            contacts.push({
              profileLink: normalized.url,
              name: row.Name || row.name || undefined,
              category: row.Category || row.category || undefined,
              ...row,
            });
          } catch (error) {
            errors.push({
              row: index + 2,
              error: (error as Error).message,
              data: row,
            });
          }
        });

        resolve({ contacts, errors });
      },
      error: (error) => {
        resolve({
          contacts: [],
          errors: [{ row: 0, error: error.message, data: null }],
        });
      },
    });
  });
}

/**
 * Normalize various Instagram profile formats to standard URL
 * Handles:
 * - https://www.instagram.com/username/
 * - https://instagram.com/username/
 * - @username
 * - username
 */
export function normalizeProfileLink(input: string): {
  url: string;
  username: string;
} {
  let username = input.trim();

  // Remove @ prefix if present
  if (username.startsWith('@')) {
    username = username.substring(1);
  }

  // If it's already a URL, extract username
  if (username.startsWith('http')) {
    try {
      const url = new URL(username);
      const pathParts = url.pathname.split('/').filter(Boolean);
      username = pathParts[0] || '';
    } catch {
      // Invalid URL, treat as username
      username = username.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
    }
  }

  // Remove any trailing slashes or query params
  username = username.split('/')[0].split('?')[0].split('#')[0];

  // Validate username format (alphanumeric, dots, underscores only)
  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    throw new Error(`Invalid username format: ${username}`);
  }

  return {
    url: `https://www.instagram.com/${username}/`,
    username,
  };
}

/**
 * Convert parsed contacts to Contact objects
 */
export function parsedContactsToContacts(
  parsedContacts: ParsedContact[]
): Omit<Contact, 'id'>[] {
  return parsedContacts.map((parsed) => {
    const normalized = normalizeProfileLink(parsed.profileLink);
    return {
      username: normalized.username,
      profileUrl: normalized.url,
      name: parsed.name,
      category: parsed.category,
      customFields: extractCustomFields(parsed),
      status: 'pending' as const,
    };
  });
}

/**
 * Extract custom fields from parsed contact
 */
function extractCustomFields(
  parsed: ParsedContact
): Record<string, string> | undefined {
  const customFields: Record<string, string> = {};
  const standardFields = ['profileLink', 'name', 'category', 'Profile Link', 'Name', 'Category'];

  let hasCustomFields = false;
  Object.entries(parsed).forEach(([key, value]) => {
    if (!standardFields.includes(key) && value !== undefined) {
      customFields[key] = value;
      hasCustomFields = true;
    }
  });

  return hasCustomFields ? customFields : undefined;
}

/**
 * Export contacts to CSV
 */
export function exportToCSV(contacts: Contact[]): string {
  const csv = Papa.unparse(
    contacts.map((contact) => ({
      'Profile Link': contact.profileUrl,
      'Name': contact.name || '',
      'Category': contact.category || '',
      'Status': contact.status,
      'Error': contact.errorMessage || '',
      'Sent At': contact.sentAt ? new Date(contact.sentAt).toISOString() : '',
    }))
  );

  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

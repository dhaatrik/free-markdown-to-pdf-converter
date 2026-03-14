import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a URL to prevent XSS attacks by blocking dangerous protocols.
 * Allows common safe protocols and relative paths.
 */
export function safeProtocol(url: string | undefined): string | undefined {
  if (!url) return url;

  // Remove whitespace and control characters
  const sanitizedUrl = url.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  const lowercaseUrl = sanitizedUrl.toLowerCase();

  // Block dangerous protocols
  if (
    lowercaseUrl.startsWith('javascript:') ||
    lowercaseUrl.startsWith('data:') ||
    lowercaseUrl.startsWith('vbscript:')
  ) {
    return undefined;
  }

  return sanitizedUrl;
}

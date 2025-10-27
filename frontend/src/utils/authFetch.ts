import { WalletClient } from "@bsv/sdk";

// Extend WalletClient interface to include authFetch (BRC-77/78)
export interface WalletWithAuthFetch extends WalletClient {
  authFetch?: (url: string, options?: RequestInit) => Promise<Response>;
}

// Extend window to include bsv object with authFetch
declare global {
  interface Window {
    bsv?: {
      authFetch?: (url: string, options?: RequestInit) => Promise<Response>;
    };
    bsvWalletAddress?: string; // For fallback
  }
}

/**
 * BRC-104 authFetch wrapper with fallback
 * Uses the wallet's authFetch to make authenticated requests to protected endpoints
 * Falls back to trust-based fetch if authFetch is not available
 * 
 * @param wallet - The BSV wallet client (can be null, will use window.bsv instead)
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @param walletAddress - Optional wallet address for fallback (trust-based)
 * @returns The response from the authenticated request
 */
export async function authFetch(
  wallet: WalletClient | null,
  url: string,
  options?: RequestInit,
  walletAddress?: string
): Promise<Response> {
  try {
    // Try to use window.bsv.authFetch (browser wallet API)
    if (typeof window !== 'undefined' && window.bsv?.authFetch) {
      console.log('🔐 Using window.bsv.authFetch (BRC-104)');
      return await window.bsv.authFetch(url, options);
    }

    // Fallback: Try wallet instance
    const walletWithAuth = wallet as WalletWithAuthFetch;
    
    if (walletWithAuth && typeof walletWithAuth.authFetch === 'function') {
      console.log('🔐 Using wallet.authFetch (BRC-104)');
      return await walletWithAuth.authFetch(url, options);
    }

    // BRC-104 not available - use fallback with trust-based POST
    console.warn('⚠️ BRC-104 not available, falling back to trust-based authentication');
    
    if (!walletAddress) {
      walletAddress = typeof window !== 'undefined' ? window.bsvWalletAddress : undefined;
    }
    
    if (!walletAddress) {
      throw new Error(
        'BRC-104 authFetch not available and no walletAddress provided for fallback. ' +
        'Please update your BSV Desktop wallet to support BRC-77/78.'
      );
    }

    // Use POST method for fallback (backend has POST endpoint for non-BRC104 requests)
    console.log('📤 Using fallback POST with walletAddress (trust-based)');
    console.log('📍 URL:', url);
    console.log('👤 Wallet:', walletAddress);
    
    return await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      body: JSON.stringify({ walletAddress }),
    });
  } catch (error) {
    console.error('authFetch error:', error);
    throw error;
  }
}

interface ArticleData {
  id: string;
  title: string;
  author: string;
  subject: string;
  wordCount: number;
  price: number;
  fullContent: string;
  txid: string;
  isPurchased: boolean;
}

/**
 * Fetch article content using BRC-104 authenticated endpoint
 * 
 * @param wallet - The BSV wallet client (can be null, will use window.bsv)
 * @param articleId - The article ID to fetch
 * @returns The article data with full content
 */
export async function fetchAuthenticatedArticle(
  wallet: WalletClient | null,
  articleId: string
): Promise<ArticleData> {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const url = `${apiUrl}/api/protected/articles/${articleId}/content`;
  
  try {
    const response = await authFetch(wallet, url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Authentication failed');
    }

    const data = await response.json();
    return data as ArticleData;
  } catch (error) {
    console.error('Error fetching authenticated article:', error);
    throw error;
  }
}

interface BRC104Info {
  articleId: string;
  title: string;
  author: string;
  price: number;
  paymentAddress: string;
  brc104: {
    enabled: boolean;
    endpoint: string;
    method: string;
    authentication: string;
  };
  usage: {
    description: string;
    steps: string[];
    example: {
      javascript: string;
    };
  };
}

/**
 * Get information about BRC-104 protected endpoint for an article
 * 
 * @param articleId - The article ID
 * @returns Information about how to use the protected endpoint
 */
export async function getBRC104Info(articleId: string): Promise<BRC104Info> {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const url = `${apiUrl}/api/protected/articles/${articleId}/info`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch BRC-104 info');
    }
    
    const data = await response.json();
    return data as BRC104Info;
  } catch (error) {
    console.error('Error fetching BRC-104 info:', error);
    throw error;
  }
}

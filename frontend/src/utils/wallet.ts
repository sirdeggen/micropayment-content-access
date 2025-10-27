// BRC-100 Wallet Integration for BSV Desktop
// Lightweight helper for connect / payments / auth (SPV) operations

export interface WalletInfo {
	address: string;
	publicKey: string;
	isConnected: boolean;
	authToken?: string;
	authExpiry?: string;
}

export interface PaymentRequest {
	satoshis: number;
	data?: string[];
	outputs?: Array<{
		to: string;
		satoshis: number;
	}>;
}

export interface PaymentResponse {
	txid: string;
	rawtx: string;
}

export interface AuthResponse {
	token: string;
	expiry?: string;
	address?: string;
}

// Minimal shape of injected wallet object we expect from BSV Desktop
interface BsvWindow {
	connect?: () => Promise<{ address?: string; pubkey?: string } | undefined>;
	disconnect?: () => Promise<void>;
	send?: (params: { satoshis?: number; outputs?: Array<{ to: string; satoshis: number }>; data?: string[] }) => Promise<{ txid?: string; rawtx?: string } | undefined>;
	getBalance?: () => Promise<number>;
	getNetwork?: () => Promise<string>;
	on?: (event: string, cb: (...args: unknown[]) => void) => void;
	// auth can be either an object with request/revoke or a function that returns an auth response
	auth?:
		| {
				request?: (opts: { scopes: string[] }) => Promise<{ token: string; expiry?: string; address?: string }>;
				revoke?: (opts?: { token?: string } | string) => Promise<boolean>;
			}
		| ((...args: unknown[]) => Promise<{ token: string; expiry?: string; address?: string }>);
	revoke?: (token?: string) => Promise<boolean>;
}

declare global {
	interface Window {
		bsv?: BsvWindow;
	}
}

// Check if BSV Desktop wallet is available
export const isWalletAvailable = (): boolean => {
	return typeof window !== 'undefined' && typeof window.bsv !== 'undefined';
};

// Connect to BSV Desktop wallet using BRC-100 style API
export const connectWallet = async (): Promise<WalletInfo> => {
	if (!isWalletAvailable()) {
		throw new Error('BSV Desktop wallet not found. Please install BSV Desktop.');
	}

	const bsv = window.bsv as BsvWindow | undefined;
	if (!bsv || typeof bsv.connect !== 'function') {
		throw new Error('Wallet connect API not available');
	}

	const connection = await bsv.connect();
	if (!connection || !connection.address) {
		throw new Error('Failed to connect to wallet');
	}

	return {
		address: connection.address,
		publicKey: connection.pubkey || '',
		isConnected: true,
	};
};

// Disconnect from wallet
export const disconnectWallet = async (): Promise<void> => {
	if (!isWalletAvailable()) return;
	const bsv = window.bsv as BsvWindow | undefined;
	if (bsv && typeof bsv.disconnect === 'function') {
		await bsv.disconnect();
	}
};

// Make a payment using BRC-100 style send
export const sendPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
	if (!isWalletAvailable()) {
		throw new Error('BSV Desktop wallet not found');
	}

	const bsv = window.bsv as BsvWindow | undefined;
	if (!bsv || typeof bsv.send !== 'function') {
		throw new Error('Wallet send API not available');
	}

	const params: { satoshis?: number; outputs?: Array<{ to: string; satoshis: number }>; data?: string[] } = {};
	if (typeof request.satoshis === 'number') params.satoshis = request.satoshis;
	if (request.outputs && request.outputs.length) params.outputs = request.outputs;
	if (request.data && request.data.length) params.data = request.data;

	const result = await bsv.send(params);
	if (!result || !result.txid) throw new Error('Payment failed: no transaction id');

	return {
		txid: result.txid,
		rawtx: result.rawtx || '',
	};
};

// Get balance (if exposed)
export const getBalance = async (): Promise<number> => {
	if (!isWalletAvailable()) throw new Error('BSV Desktop wallet not found');
	const bsv = window.bsv as BsvWindow | undefined;
	if (bsv && typeof bsv.getBalance === 'function') {
		return await bsv.getBalance();
	}
	return 0;
};

// Get network
export const getNetwork = async (): Promise<string> => {
	if (!isWalletAvailable()) return 'unknown';
	const bsv = window.bsv as BsvWindow | undefined;
	if (bsv && typeof bsv.getNetwork === 'function') {
		return await bsv.getNetwork();
	}
	return 'mainnet';
};

// Listen for wallet events
export const onWalletEvent = (event: 'accountsChanged' | 'disconnect', callback: (data?: unknown) => void): void => {
	if (!isWalletAvailable()) return;
	const bsv = window.bsv as BsvWindow | undefined;
	if (bsv && typeof bsv.on === 'function') {
		bsv.on(event, callback);
	}
};

// Request SPV auth token from wallet (supports auth.request() or auth() function)
export const requestAuth = async (scopes: string[] = ['auth']): Promise<AuthResponse> => {
	if (!isWalletAvailable()) throw new Error('BSV Desktop wallet not found');
	const bsv = window.bsv as BsvWindow | undefined;
	if (!bsv) throw new Error('Wallet object not available');

	// If auth is an object with request()
	if (typeof bsv.auth === 'object' && bsv.auth !== null) {
		const authObj = bsv.auth as NonNullable<BsvWindow['auth']> & { request?: (opts: { scopes: string[] }) => Promise<{ token: string; expiry?: string; address?: string }> };
		if (typeof authObj.request === 'function') {
			const res = await authObj.request({ scopes });
			if (!res || !res.token) throw new Error('Auth request failed: no token returned');
			return { token: res.token, expiry: res.expiry, address: res.address };
		}
	}

	// If auth is a function
	if (typeof bsv.auth === 'function') {
		const authFn = bsv.auth as (...args: unknown[]) => Promise<{ token: string; expiry?: string; address?: string }>;
		const res = await authFn(scopes);
		if (!res || !res.token) throw new Error('Auth request failed: no token returned');
		return { token: res.token, expiry: res.expiry, address: res.address };
	}

	throw new Error('Wallet does not support auth requests');
};

// Revoke an auth token. Accepts token (optional) and attempts supported revoke methods.
export const revokeAuth = async (token?: string): Promise<boolean> => {
	if (!isWalletAvailable()) throw new Error('BSV Desktop wallet not found');
	const bsv = window.bsv as BsvWindow | undefined;
	if (!bsv) throw new Error('Wallet object not available');

	// If auth is object with revoke
	if (typeof bsv.auth === 'object' && bsv.auth !== null) {
		const authObj = bsv.auth as NonNullable<BsvWindow['auth']> & { revoke?: (opts?: { token?: string } | string) => Promise<boolean> };
		if (typeof authObj.revoke === 'function') {
			return !!(await authObj.revoke(token ? { token } : undefined));
		}
	}

	// If auth is a function and has revoke attached
	if (typeof bsv.auth === 'function') {
		const authFn = bsv.auth as ((...args: unknown[]) => Promise<{ token: string }>) & { revoke?: (t?: string) => Promise<boolean> };
		if (typeof authFn.revoke === 'function') {
			return !!(await authFn.revoke(token));
		}
	}

	// Fallback to top-level revoke
	if (typeof bsv.revoke === 'function') {
		return !!(await bsv.revoke(token));
	}

	throw new Error('Wallet does not support auth revoke');
};


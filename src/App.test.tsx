import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
        },
    },
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since App has lazy loaded routes and authentication, it might show a loading state or redirect.
        // We just want to ensure it doesn't throw.
        // We can check for something that is always present, like Toaster or just pass if render succeeds.
        expect(document.body).toBeInTheDocument();
    });
});

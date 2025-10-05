// Demo data storage utilities for client-side demo mode
// Stores demo data in localStorage and resets on refresh

export interface DemoBook {
    id: string;
    title: string;
    authors: string[];
    isbn?: string;
    isbn13?: string;
    publisher?: string;
    published_date?: string;
    page_count?: number;
    language?: string;
    description?: string;
    condition?: string;
    condition_notes?: string;
    purchase_price?: number;
    purchase_source?: string;
    purchase_date?: string;
    asking_price?: number;
    minimum_price?: number;
    category?: string;
    tags?: string[];
    status?: string;
    created_at: string;
    updated_at: string;
}

export interface DemoCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
}

export interface DemoData {
    books: DemoBook[];
    categories: DemoCategory[];
    metadata: {
        generated_at: string;
        version: string;
        demo_mode: boolean;
    };
}

const DEMO_STORAGE_KEY = 'scryvault_demo_data';
const DEMO_TIMESTAMP_KEY = 'scryvault_demo_timestamp';

export class DemoStorage {
    private static instance: DemoStorage;
    private data: DemoData | null = null;

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): DemoStorage {
        if (!DemoStorage.instance) {
            DemoStorage.instance = new DemoStorage();
        }
        return DemoStorage.instance;
    }

    // Check if demo data should be refreshed (older than 1 hour or first load)
    public shouldRefresh(): boolean {
        const timestamp = localStorage.getItem(DEMO_TIMESTAMP_KEY);
        if (!timestamp) return true;

        const lastRefresh = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);

        return hoursDiff >= 1;
    }

    // Fetch fresh demo data from the API
    public async fetchFreshData(): Promise<DemoData> {
        try {
            const response = await fetch('/api/demo/sample-data');
            if (!response.ok) {
                throw new Error('Failed to fetch demo data');
            }

            const data = await response.json();
            this.data = data;
            this.saveToStorage();
            return data;
        } catch (error) {
            console.error('Error fetching demo data:', error);
            // Return fallback data if API fails
            return this.getFallbackData();
        }
    }

    // Get demo data (fetch fresh if needed)
    public async getData(): Promise<DemoData> {
        if (!this.data || this.shouldRefresh()) {
            return await this.fetchFreshData();
        }
        return this.data;
    }

    // Update demo data locally (for demo operations)
    public updateData(updates: Partial<DemoData>): void {
        if (this.data) {
            this.data = { ...this.data, ...updates };
            this.saveToStorage();
        }
    }

    // Add a new book to demo data
    public addBook(book: Omit<DemoBook, 'id' | 'created_at' | 'updated_at'>): DemoBook {
        const newBook: DemoBook = {
            ...book,
            id: `demo-book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Initialize data if it doesn't exist
        if (!this.data) {
            this.data = this.getFallbackData();
        }

        this.data.books.push(newBook);
        this.saveToStorage();

        console.log('Demo book added:', newBook.title, 'Total books:', this.data.books.length);
        return newBook;
    }

    // Update a book in demo data
    public updateBook(id: string, updates: Partial<DemoBook>): DemoBook | null {
        if (!this.data) {
            this.data = this.getFallbackData();
        }

        const bookIndex = this.data.books.findIndex(book => book.id === id);
        if (bookIndex === -1) return null;

        const updatedBook = {
            ...this.data.books[bookIndex],
            ...updates,
            updated_at: new Date().toISOString()
        };

        this.data.books[bookIndex] = updatedBook;
        this.saveToStorage();
        return updatedBook;
    }

    // Delete a book from demo data
    public deleteBook(id: string): boolean {
        if (!this.data) {
            this.data = this.getFallbackData();
        }

        const initialLength = this.data.books.length;
        this.data.books = this.data.books.filter(book => book.id !== id);

        if (this.data.books.length < initialLength) {
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Save demo data to real user account
    public async saveToAccount(userId: string): Promise<{ success: boolean; error?: string }> {
        if (!this.data) {
            return { success: false, error: 'No demo data to save' };
        }

        try {
            const response = await fetch('/api/demo/save-to-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    data: this.data
                })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to save data' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error saving demo data to account:', error);
            return { success: false, error: 'Network error' };
        }
    }

    // Clear demo data
    public clearData(): void {
        this.data = null;
        localStorage.removeItem(DEMO_STORAGE_KEY);
        localStorage.removeItem(DEMO_TIMESTAMP_KEY);
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(DEMO_STORAGE_KEY);
            if (stored) {
                this.data = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading demo data from storage:', error);
            this.data = null;
        }
    }

    private saveToStorage(): void {
        if (this.data) {
            try {
                localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(this.data));
                localStorage.setItem(DEMO_TIMESTAMP_KEY, new Date().toISOString());
            } catch (error) {
                console.error('Error saving demo data to storage:', error);
            }
        }
    }

    private getFallbackData(): DemoData {
        return {
            books: [
                {
                    id: 'demo-fallback-1',
                    title: 'Sample Book',
                    authors: ['Sample Author'],
                    isbn: '978-1234567890',
                    condition: 'good',
                    asking_price: 15.99,
                    status: 'draft',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ],
            categories: [
                { id: 'demo-cat-fallback', name: 'Sample Category', color: '#3b82f6' }
            ],
            metadata: {
                generated_at: new Date().toISOString(),
                version: '1.0',
                demo_mode: true
            }
        };
    }
}

// Export singleton instance
export const demoStorage = DemoStorage.getInstance();

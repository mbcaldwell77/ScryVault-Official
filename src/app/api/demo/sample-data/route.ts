import { NextResponse } from 'next/server';

// Sample demo data - randomized on each request
const generateSampleBooks = () => {
    const titles = [
        'The Great Gatsby', 'To Kill a Mockingbird', '1984', 'Pride and Prejudice',
        'The Catcher in the Rye', 'Lord of the Flies', 'The Hobbit', 'Dune',
        'The Handmaid\'s Tale', 'Brave New World', 'The Chronicles of Narnia',
        'Harry Potter and the Sorcerer\'s Stone', 'The Lord of the Rings',
        'The Alchemist', 'The Kite Runner'
    ];

    const authors = [
        'F. Scott Fitzgerald', 'Harper Lee', 'George Orwell', 'Jane Austen',
        'J.D. Salinger', 'William Golding', 'J.R.R. Tolkien', 'Frank Herbert',
        'Margaret Atwood', 'Aldous Huxley', 'C.S. Lewis', 'J.K. Rowling',
        'Paulo Coelho', 'Khaled Hosseini', 'Toni Morrison'
    ];

    const conditions = ['new', 'like_new', 'very_good', 'good', 'acceptable'];
    const categories = [
        'Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Romance',
        'Biography', 'History', 'Self-Help', 'Textbook', 'Children'
    ];

    const books = [];
    const bookCount = Math.floor(Math.random() * 8) + 5; // 5-12 books

    for (let i = 0; i < bookCount; i++) {
        books.push({
            id: `demo-book-${i}-${Date.now()}`,
            title: titles[Math.floor(Math.random() * titles.length)],
            authors: [authors[Math.floor(Math.random() * authors.length)]],
            isbn: `978-${Math.floor(Math.random() * 900000000) + 100000000}`,
            isbn13: `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`,
            publisher: `Publisher ${Math.floor(Math.random() * 20) + 1}`,
            published_date: `${2020 - Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            page_count: Math.floor(Math.random() * 400) + 100,
            language: 'en',
            description: `A fascinating book about ${['adventure', 'mystery', 'love', 'war', 'friendship', 'science'][Math.floor(Math.random() * 6)]}.`,
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            condition_notes: Math.random() > 0.7 ? 'Minor shelf wear' : null,
            purchase_price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
            purchase_source: ['Amazon', 'Barnes & Noble', 'Local Bookstore', 'Online'][Math.floor(Math.random() * 4)],
            purchase_date: `${2023 - Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            asking_price: parseFloat((Math.random() * 30 + 10).toFixed(2)),
            minimum_price: parseFloat((Math.random() * 15 + 5).toFixed(2)),
            category: categories[Math.floor(Math.random() * categories.length)],
            tags: ['demo', 'sample', 'fiction'].slice(0, Math.floor(Math.random() * 3) + 1),
            status: ['draft', 'listed'][Math.floor(Math.random() * 2)],
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    return books;
};

const generateSampleCategories = () => [
    { id: 'demo-cat-1', name: 'Fiction', description: 'Novels and fictional works', color: '#3b82f6' },
    { id: 'demo-cat-2', name: 'Non-Fiction', description: 'Educational and factual books', color: '#10b981' },
    { id: 'demo-cat-3', name: 'Science Fiction', description: 'Futuristic and speculative fiction', color: '#8b5cf6' },
    { id: 'demo-cat-4', name: 'Mystery', description: 'Detective and thriller novels', color: '#f59e0b' },
    { id: 'demo-cat-5', name: 'Biography', description: 'Life stories and memoirs', color: '#06b6d4' }
];

export async function GET() {
    try {
        const sampleData = {
            books: generateSampleBooks(),
            categories: generateSampleCategories(),
            metadata: {
                generated_at: new Date().toISOString(),
                version: '1.0',
                demo_mode: true
            }
        };

        return NextResponse.json(sampleData, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Error generating demo data:', error);
        return NextResponse.json(
            { error: 'Failed to generate demo data' },
            { status: 500 }
        );
    }
}

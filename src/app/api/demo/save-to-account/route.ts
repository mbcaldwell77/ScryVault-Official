import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { DemoBook, DemoCategory } from '@/lib/demo-storage';

export async function POST(request: Request) {
    try {
        const { userId, data } = await request.json();

        if (!userId || !data) {
            return NextResponse.json(
                { error: 'Missing userId or data' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();

        // Verify user is authenticated and matches the userId
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || user.id !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const results = {
            books: { created: 0, errors: [] as string[] },
            categories: { created: 0, errors: [] as string[] }
        };

        // Save categories first (books might reference them)
        if (data.categories && Array.isArray(data.categories)) {
            for (const category of data.categories as DemoCategory[]) {
                try {
                    const { error } = await supabase
                        .from('categories')
                        .insert({
                            name: category.name,
                            description: category.description,
                            color: category.color || '#10b981'
                        });

                    if (error) {
                        results.categories.errors.push(`${category.name}: ${error.message}`);
                    } else {
                        results.categories.created++;
                    }
                } catch (err) {
                    results.categories.errors.push(`${category.name}: ${err}`);
                }
            }
        }

        // Save books
        if (data.books && Array.isArray(data.books)) {
            for (const book of data.books as DemoBook[]) {
                try {
                    // Find category ID by name (if category exists)
                    let categoryId = null;
                    if (book.category) {
                        const { data: category } = await supabase
                            .from('categories')
                            .select('id')
                            .eq('name', book.category)
                            .single();
                        categoryId = category?.id;
                    }

                    const bookData = {
                        user_id: userId,
                        title: book.title,
                        authors: book.authors,
                        isbn: book.isbn,
                        isbn13: book.isbn13,
                        publisher: book.publisher,
                        published_date: book.published_date,
                        page_count: book.page_count,
                        language: book.language || 'en',
                        description: book.description,
                        condition: book.condition,
                        condition_notes: book.condition_notes,
                        purchase_price: book.purchase_price,
                        purchase_source: book.purchase_source,
                        purchase_date: book.purchase_date,
                        asking_price: book.asking_price,
                        minimum_price: book.minimum_price,
                        category_id: categoryId,
                        tags: book.tags,
                        status: book.status || 'draft'
                    };

                    const { error } = await supabase
                        .from('books')
                        .insert(bookData);

                    if (error) {
                        results.books.errors.push(`${book.title}: ${error.message}`);
                    } else {
                        results.books.created++;
                    }
                } catch (err) {
                    results.books.errors.push(`${book.title}: ${err}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            results,
            message: `Successfully saved ${results.books.created} books and ${results.categories.created} categories to your account`
        });

    } catch (error) {
        console.error('Error saving demo data to account:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

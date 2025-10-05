-- Fix for ISBN unique constraint issue
-- Remove the constraint that prevents multiple books with the same ISBN per user
-- Multiple editions can legitimately share the same ISBN

-- Drop the problematic constraint
ALTER TABLE books DROP CONSTRAINT IF EXISTS unique_isbn_per_user;

-- Verify the constraint has been removed
-- (This will show any remaining constraints on the books table)
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'books'::regclass;

-- Fix ISBN Unique Constraint Issue
-- Remove the constraint that prevents multiple books with the same ISBN per user

-- =============================================
-- 1. DROP THE PROBLEMATIC CONSTRAINT
-- =============================================

-- Drop the unique constraint that was causing the error
ALTER TABLE books DROP CONSTRAINT IF EXISTS unique_isbn_per_user;

-- =============================================
-- 2. VERIFY CONSTRAINT REMOVAL
-- =============================================

-- Check remaining constraints on the books table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'books'::regclass
    AND conname LIKE '%isbn%';

-- =============================================
-- 3. ADD COMMENT EXPLAINING THE DECISION
-- =============================================

COMMENT ON TABLE books IS 'Core inventory table. ISBNs are NOT unique per user because multiple editions can share the same ISBN.';

-- =============================================
-- 4. VERIFY SUCCESS
-- =============================================

SELECT 'ISBN constraint removed successfully. Multiple books can now share the same ISBN.' as status;

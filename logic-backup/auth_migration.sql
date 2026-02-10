-- 1. Add user_id column to trips table
ALTER TABLE public.trips 
ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Update existing trips to a safe default (optional, if you have data)
-- UPDATE public.trips SET user_id = auth.uid() WHERE user_id IS NULL;

-- 3. DROP old prototype policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.trips;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.trips;

-- 4. Create NEW Secure Policies
CREATE POLICY "Users can view their own trips" 
ON public.trips FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips" 
ON public.trips FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips FOR DELETE 
USING (auth.uid() = user_id);

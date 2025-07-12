-- Enable RLS on blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create is_admin() function if not exists
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@playhub.com', 'developer@playhub.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anyone to read blogs
CREATE POLICY "Anyone can read blogs"
  ON blogs
  FOR SELECT
  TO public
  USING (true);

-- Allow only admins to insert blogs
CREATE POLICY "Only admins can insert blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Allow only admins to update blogs
CREATE POLICY "Only admins can update blogs"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow only admins to delete blogs
CREATE POLICY "Only admins can delete blogs"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (is_admin()); 
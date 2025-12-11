-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  type TEXT DEFAULT 'link' CHECK (type IN ('video', 'link')),
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

-- Create item_tags junction table
CREATE TABLE public.item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(item_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Items policies
CREATE POLICY "Users can view own items" ON public.items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own items" ON public.items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.items FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- Item_tags policies (check ownership through items)
CREATE POLICY "Users can view own item_tags" ON public.item_tags FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid()));
CREATE POLICY "Users can create own item_tags" ON public.item_tags FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid()));
CREATE POLICY "Users can delete own item_tags" ON public.item_tags FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid()));

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Création de la table des événements de la timeline
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    notes_celeste TEXT DEFAULT '',
    notes_julie TEXT DEFAULT '',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création de la table des photos
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    url_thumbnail TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security (RLS) mais autoriser l'accès complet en anonyme
-- (L'application étant privée entre Céleste & Julie, l'URL et la clé ne seront pas publiques)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.events FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete access" ON public.photos FOR DELETE USING (true);

-- Active le temps-réel (Realtime) sur la table events pour la synchronisation
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;

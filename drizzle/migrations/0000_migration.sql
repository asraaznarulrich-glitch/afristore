
create type public.app_role as enum ('admin','user');
create type public.app_status as enum ('pending','approved','rejected');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.categories (
  slug text primary key,
  name_fr text not null,
  name_en text not null,
  icon text not null,
  sort int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Categories public" on public.categories for select to anon, authenticated using (true);

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid,
  developer_name text not null,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  category_slug text not null references public.categories(slug),
  icon_url text,
  screenshots text[] not null default '{}',
  download_url text not null,
  countries text[] not null default '{}',
  languages text[] not null default '{}',
  size_mb numeric,
  is_free boolean not null default true,
  status app_status not null default 'pending',
  featured boolean not null default false,
  made_in_africa boolean not null default true,
  rating_avg numeric not null default 0,
  rating_count int not null default 0,
  downloads int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.apps to anon;
grant select, insert, update, delete on public.apps to authenticated;
grant all on public.apps to service_role;
alter table public.apps enable row level security;
create policy "Approved apps public" on public.apps for select to anon, authenticated
  using (status = 'approved' or developer_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Devs submit apps" on public.apps for insert to authenticated with check (developer_id = auth.uid());
create policy "Owner or admin update" on public.apps for update to authenticated
  using (developer_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Owner or admin delete" on public.apps for delete to authenticated
  using (developer_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.protect_app_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.has_role(auth.uid(),'admin') then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending'; new.featured := false; new.rating_avg := 0; new.rating_count := 0; new.downloads := 0;
  else
    new.featured := old.featured; new.rating_avg := old.rating_avg; new.rating_count := old.rating_count; new.downloads := old.downloads;
    new.status := 'pending';
  end if;
  return new;
end $$;
create trigger apps_protect before insert or update on public.apps
  for each row when (current_user = 'authenticated') execute function public.protect_app_fields();

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (app_id, user_id)
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Reviews public" on public.reviews for select to anon, authenticated using (true);
create policy "Own review insert" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "Own review update" on public.reviews for update to authenticated using (user_id = auth.uid());
create policy "Own or admin delete review" on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.refresh_app_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare aid uuid := coalesce(new.app_id, old.app_id);
begin
  update public.apps set
    rating_avg = coalesce((select round(avg(rating)::numeric,1) from public.reviews where app_id = aid),0),
    rating_count = (select count(*) from public.reviews where app_id = aid)
  where id = aid;
  return null;
end $$;
create trigger reviews_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_app_rating();

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "Users report" on public.reports for insert to authenticated with check (user_id = auth.uid());
create policy "Admins read reports" on public.reports for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete reports" on public.reports for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "Read app media" on storage.objects for select to anon, authenticated using (bucket_id = 'app-media');
create policy "Users upload own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'app-media' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.categories (slug,name_fr,name_en,icon,sort) values
('finance','Finance','Finance','wallet',1),
('education','Éducation','Education','graduation-cap',2),
('commerce','Commerce','Commerce','shopping-bag',3),
('sante','Santé','Health','heart-pulse',4),
('jeux','Jeux','Games','gamepad-2',5),
('transport','Transport','Transport','bus',6),
('agriculture','Agriculture','Agriculture','sprout',7),
('social','Social','Social','users',8),
('outils','Outils','Tools','wrench',9);

insert into public.apps (developer_name,name,short_description,description,category_slug,download_url,countries,languages,size_mb,is_free,status,featured,made_in_africa,rating_avg,rating_count,downloads) values
('Wave Mobile Money','Wave','Transferts d''argent sans frais cachés','Envoyez et recevez de l''argent instantanément, payez vos factures et marchands avec des frais parmi les plus bas.','finance','https://www.wave.com','{"Sénégal","Côte d''Ivoire","Mali","Burkina Faso"}','{"Français","Anglais","Wolof"}',18,true,'approved',true,true,4.7,1250,5000000),
('Safaricom','M-Pesa','Le portefeuille mobile du Kenya','Paiements, épargne et micro-crédit depuis votre téléphone.','finance','https://www.safaricom.co.ke','{"Kenya","Tanzanie"}','{"Anglais","Swahili"}',35,true,'approved',true,true,4.5,3400,10000000),
('Gebeya','Gebeya','Talents tech africains','Trouvez des développeurs et designers freelance vérifiés partout en Afrique.','outils','https://gebeya.com','{"Éthiopie","Kenya","Nigeria"}','{"Anglais"}',12,true,'approved',false,true,4.2,210,50000),
('Jumia','Jumia','Shopping en ligne en Afrique','Achetez électronique, mode et alimentation avec livraison et paiement à la livraison.','commerce','https://www.jumia.com','{"Nigeria","Côte d''Ivoire","Maroc","Égypte","Kenya","Sénégal"}','{"Français","Anglais","Arabe"}',22,true,'approved',true,true,4.1,8900,10000000),
('uLesson','uLesson','Cours vidéo pour collégiens et lycéens','Leçons vidéo, exercices et examens blancs adaptés aux programmes africains.','education','https://ulesson.com','{"Nigeria","Ghana"}','{"Anglais"}',45,false,'approved',false,true,4.6,760,1000000),
('Yango','Yango','Courses en ville, rapides et abordables','Commandez une course en quelques secondes et suivez votre chauffeur en temps réel.','transport','https://yango.com','{"Côte d''Ivoire","Sénégal","Cameroun","Ghana"}','{"Français","Anglais"}',30,true,'approved',false,false,4.3,2100,1000000),
('Hello Tractor','Hello Tractor','Louez un tracteur près de chez vous','Mettez en relation agriculteurs et propriétaires de tracteurs pour mécaniser les récoltes.','agriculture','https://hellotractor.com','{"Nigeria","Kenya","Ghana"}','{"Anglais","Haoussa"}',9,true,'approved',false,true,4.4,180,100000),
('DabaDoc','DabaDoc','Prenez rendez-vous chez le médecin','Trouvez un médecin, réservez une consultation et faites des téléconsultations.','sante','https://www.dabadoc.com','{"Maroc","Algérie","Tunisie","Nigeria"}','{"Français","Arabe","Anglais"}',15,true,'approved',false,true,4.5,540,500000),
('Kiro''o Games','Aurion','RPG d''action inspiré de l''Afrique','Le premier jeu d''action-RPG camerounais, ancré dans la mythologie africaine.','jeux','https://kiroogames.com','{"Cameroun","Toute l''Afrique"}','{"Français","Anglais"}',120,false,'approved',true,true,4.3,320,100000),
('Gozem','Gozem','La super-app d''Afrique francophone','Moto-taxi, livraison de repas et paiements dans une seule application.','transport','https://gozem.co','{"Togo","Bénin","Cameroun","Gabon"}','{"Français","Anglais"}',25,true,'approved',false,true,4.4,960,1000000),
('Eneza','Eneza Education','Apprendre même sans internet','Révisions par SMS et appli légère pour élèves en zones rurales.','education','https://enezaeducation.com','{"Kenya","Ghana","Côte d''Ivoire"}','{"Anglais","Français","Swahili"}',6,true,'approved',false,true,4.2,150,100000),
('Chipper Cash','Chipper','Envoyez de l''argent entre pays africains','Transferts transfrontaliers gratuits et rapides entre plusieurs pays africains.','finance','https://chippercash.com','{"Nigeria","Ghana","Ouganda","Kenya","Afrique du Sud"}','{"Anglais"}',28,true,'approved',false,true,4.0,1100,1000000);

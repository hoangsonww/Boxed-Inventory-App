create table public.profiles (
                                 id uuid not null,
                                 username text null,
                                 avatar_url text null,
                                 created_at timestamp with time zone not null default now(),
                                 constraint profiles_pkey primary key (id),
                                 constraint profiles_username_key unique (username),
                                 constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

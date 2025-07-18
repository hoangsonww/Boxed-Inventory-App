create table public.boxes (
                              id uuid not null default gen_random_uuid (),
                              owner_profile_id uuid not null,
                              name text not null,
                              location text null,
                              status public.box_status not null default 'unpacked'::box_status,
                              created_at timestamp with time zone not null default now(),
                              updated_at timestamp with time zone not null default now(),
                              photo_url text null,
                              constraint boxes_pkey primary key (id),
                              constraint boxes_owner_profile_id_fkey foreign KEY (owner_profile_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists ix_boxes_owner on public.boxes using btree (owner_profile_id) TABLESPACE pg_default;

create index IF not exists ix_boxes_location on public.boxes using btree (location) TABLESPACE pg_default;

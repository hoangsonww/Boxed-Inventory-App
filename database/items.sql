create table public.items (
                              id uuid not null default gen_random_uuid (),
                              box_id uuid not null,
                              type_id integer null,
                              name text not null,
                              quantity integer not null default 1,
                              photo_url text null,
                              last_used timestamp with time zone null,
                              condition text null,
                              value numeric(10, 2) null,
                              created_at timestamp with time zone not null default now(),
                              updated_at timestamp with time zone not null default now(),
                              constraint items_pkey primary key (id),
                              constraint items_box_id_fkey foreign KEY (box_id) references boxes (id) on delete CASCADE,
                              constraint items_type_id_fkey foreign KEY (type_id) references item_types (id)
) TABLESPACE pg_default;

create index IF not exists ix_items_name_fts on public.items using gin (
    to_tsvector('english'::regconfig, COALESCE(name, ''::text))
    ) TABLESPACE pg_default;

create index IF not exists ix_items_type on public.items using btree (type_id) TABLESPACE pg_default;

create index IF not exists ix_items_box on public.items using btree (box_id) TABLESPACE pg_default;

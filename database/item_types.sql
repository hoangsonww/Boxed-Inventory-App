create table public.item_types (
                                   id serial not null,
                                   name text not null,
                                   constraint item_types_pkey primary key (id),
                                   constraint item_types_name_key unique (name)
) TABLESPACE pg_default;

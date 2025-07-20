-- 1. Enable UUID funcs
create extension if not exists "pgcrypto";

-- 2. Status enum for Moving Mode
create type box_status as enum ('unpacked','packed','in_transit');

-- 3. User profile table (id ties to Supabase Auth)
create table profiles (
                          id          uuid          primary key references auth.users(id) on delete cascade,
                          username    text          unique,
                          avatar_url  text,
                          created_at  timestamptz   not null default now()
);

-- 4. Boxes
create table boxes (
                       id                  uuid          primary key default gen_random_uuid(),
                       owner_profile_id    uuid          not null references profiles(id) on delete cascade,
                       name                text          not null,
                       location            text,  -- e.g. "Under Bed", "Storage Unit"
                       status              box_status    not null default 'unpacked',
                       created_at          timestamptz   not null default now(),
                       updated_at          timestamptz   not null default now()
);

-- 5. Shared‐access (roommates/family)
create table box_collaborators (
                                   box_id                  uuid    not null references boxes(id) on delete cascade,
                                   collaborator_profile_id uuid    not null references profiles(id) on delete cascade,
                                   role                    text    not null default 'viewer',  -- or 'editor'
                                   primary key (box_id, collaborator_profile_id)
);

-- 6. Item types (for auto‐grouping/filtering)
create table item_types (
                            id    serial    primary key,
                            name  text      not null unique    -- e.g. "Books", "Electronics"
);

-- 7. Items in boxes
create table items (
                       id           uuid          primary key default gen_random_uuid(),
                       box_id       uuid          not null references boxes(id) on delete cascade,
                       type_id      int           references item_types(id),
                       name         text          not null,
                       quantity     int           not null default 1,
                       photo_url    text,
                       last_used    timestamptz,
                       condition    text,
                       value        numeric(10,2),
                       created_at   timestamptz   not null default now(),
                       updated_at   timestamptz   not null default now()
);

-- 8. Indexes for fast search & filter
--    Full‑text search on item names
create index ix_items_name_fts
    on items
    using gin(to_tsvector('english', coalesce(name, '')));
--    Filters on type, box
create index ix_items_type    on items(type_id);
create index ix_items_box     on items(box_id);
--    Owner lookup & location filter
create index ix_boxes_owner    on boxes(owner_profile_id);
create index ix_boxes_location on boxes(location);

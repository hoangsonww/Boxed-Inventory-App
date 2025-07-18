create table public.box_collaborators (
                                          box_id uuid not null,
                                          collaborator_profile_id uuid not null,
                                          role text not null default 'viewer'::text,
                                          constraint box_collaborators_pkey primary key (box_id, collaborator_profile_id),
                                          constraint box_collaborators_box_id_fkey foreign KEY (box_id) references boxes (id) on delete CASCADE,
                                          constraint box_collaborators_collaborator_profile_id_fkey foreign KEY (collaborator_profile_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

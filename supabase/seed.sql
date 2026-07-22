-- Edit the names/colors below before running this in the Supabase SQL editor.
insert into users (name, color) values
  ('Manuel', '#F4A97B'),
  ('Anja', '#7BA9F4')
on conflict (name) do nothing;

-- Create match files stored procedure

create or replace function match_files (
  query_embedding vector(512),
  match_threshold float,
  match_count int,
  p_user_id integer
)
returns table (
  id int,
  name varchar,
  s3url varchar,
  similarity float
)
language sql stable
as $$
  select
    id,
    name,
    s3url,
    1 - (embedding <=> query_embedding) as similarity
  from files
  where (1 - (embedding <=> query_embedding) > match_threshold)
    and (user_id = p_user_id)
  order by similarity desc
  limit match_count;
$$;
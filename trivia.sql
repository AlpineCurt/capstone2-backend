\echo 'Delete and recreate trivia db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE trivia_game;
CREATE DATABASE trivia_game;
\connect trivia_game

\i trivia_schema.sql
\i trivia_seed.sql

\echo 'Delete and recreate trivia_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE trivia_test;
CREATE DATABASE trivia_test;
\connect trivia_test

\i trivia_schema.sql
## Summary
The VSCode Cline extension was used with plan/act mode. I used plan mode to generate the logic behind what would be performed, then validated with the agent that it either looked appropriate, and proceeded with an act mode, or proceeded to debate over specifics if required if something didn't look right, or if it looked like the model may be starting to hallucinate at higher context windows. I have credits allocated to both OpenAI and Anthropic, with a preference towards using Sonnet 4.5 for general coding tasks, and Opus for more complex tasks (as Opus costs more, I try to limit it's usage). I prefer to keep the model temperature as low as possible, which gives me a more straightforward and focused response, rather than allowing it excess creativity.

## Project Scaffholding

Plan Mode: "Using schema.sql as a base, generate CRUD functions for an appropriate, reusable mysql connector that can be used to target the various tables. It should support host/user/password/db env variables. The default host should be localhost, the default db should be job_tracker."
Act Mode created the DB connector, and DB repository files

Plan Mode: "Using the existing database repos as a starting point, generate basic REST flask routes to handle basic CRUD operations"
Act mode created the CRUD-specific REST routes to use with the db functionality, and run script for the app

Plan Mode: "Generate a config setup to use .env support for environment variables, with defaults for the db, and flask app"
Act mode created the top level default config/.env example files.

## Project Improvements


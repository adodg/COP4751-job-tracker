## Summary
The VSCode Cline extension was used with plan/act mode. I used plan mode to generate the logic behind what would be performed, then validated with the agent that it either looked appropriate, and proceeded with an act mode, or proceeded to debate over specifics if required if something didn't look right, or if it looked like the model may be starting to hallucinate at higher context windows. I have credits allocated to both OpenAI and Anthropic, with a preference towards using Sonnet 4.5 for general coding tasks, and Opus for more complex tasks (as Opus costs more, I try to limit it's usage). I prefer to keep the model temperature as low as possible, which gives me a more straightforward and focused response, rather than allowing it excess creativity.

## Project Scaffholding

Plan Mode (Sonnet 4.5): "Using schema.sql as a base, generate CRUD functions for an appropriate, reusable mysql connector that can be used to target the various tables. It should support host/user/password/db env variables. The default host should be localhost, the default db should be job_tracker."
Act Mode (Sonnet 4.5) created the DB connector, and DB repository files

Plan Mode (Sonnet 4.5): "Using the existing database repos as a starting point, generate basic REST flask routes to handle basic CRUD operations"
Act mode (Sonnet 4.5) created the CRUD-specific REST routes to use with the db functionality, and run script for the app

Plan Mode (Sonnet 4.5): "Generate a config setup to use .env support for environment variables, with defaults for the db, and flask app"
Act mode (Sonnet 4.5) created the top level default config/.env example files.

## Project Improvements

Improvement: With the backend now serving requests, I need to have the frontend app be able to be served by flask after it is built by vite (For purposes of this project, the dist folder is built locally and committed with the repo rather than being served as an artifact via something like Artifactory)
Plan Mode (Sonnet 4.5): Update the flask app so that it serves the built react app from the frontend dist folder at the root / endpoint of the flask app, keeping in mind react router is in use, and SPA specific considerations
Act mode (Sonnet 4.5) Updated the base flask app configuration so it would serve from job-tracker-frontend/dist on the / route, and be able to handle SPA specific routing 

## Frontend Generics

All page components were generated with a common plan mode prompt, utilizing react hooks to keep the view clean, and additional components as nessecary for elements like the add/edit modals
Plan Mode (Sonnet 4.5): Implement the view, create modal, edit modal, and delete confirmation modal for <page type> on the <page type> page. create a hook to use for keeping the api logic out of the view, utilizing components as needed
Act updated the placeholder pages, and created components as required, in addition to the hooks to use for the API calls to the flask app

## AI Pitfalls

At the start of this project, basic scaffholding with AI was very useful, but the complexity quickly grew having it handle implementation of components, especially on the frontend. I didn't realize it, but Mantine had shipped v9 as I worked on the frontend, so planning with claude meant it was using old data (v8 and below) for how it tried to build frontend components, which ended up putting me into a loop cycle of figuring out where it was lost in context, causing extra token usage.

## End result

As this project demonstrates, AI can (with heavy handholding) build out a complete fullstack application, but requires extensive knowledge of how things work under the hood (ie. I'm a fullstack developer already, so I knew where to troubleshoot when the hallucinations started). AI is a tool, and when wielded correctly, can be an effective force multiplier towards your work.
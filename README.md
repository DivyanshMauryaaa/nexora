<h1>Nexora</h1>
<p>
Nexora is a produtvitiy app that let's the user stay focused and produtive throughout the time.&#8203;
</p>

<h2>Usage Process</h2>
<ul>
  <li>Clone the repo 
    <br />
    <code>git clone https://github.com/divyanshMauryaaa/testgem</code>
  </li>
  <li>Create .env file and load it with the structure given below. make sure to put "your" values</li>
  <li>run <code>npm install</code> to install all the depedencies</li>
  <li>run <code>npm run dev</code> in terminal at the project's root folder to run and test the app</li>
</ul>

<br />

<h2>ENV Structure: </h2>

``` .env  
NEXT_PUBLIC_GEMINI_API_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

NEXT_PUBLIC_SUPABASE_PROJECT_URL=
NEXT_PUBLIC_SUPABASE_PROJECT_APIKEY=
```
<h2>SQL Postgres Database commands (for supabase's sql editor): </h2>

```.sql
/*
    Author - DivyanshMauryaaa (Github)
    Project - Nexora
    Created by - ByteForge inc,
    LISCENCE - AppCache GNU v3.0

    Paste this in supabase's sql editor of your project
    for the generation of the database for the app 
*/

-- Create test_documents table
CREATE TABLE test_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    title text NOT NULL,
    content text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    title text NOT NULL,
    content text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE reminders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    workspace_id text NOT NULL,
    title text NOT NULL,
    content text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create quick_notes table
CREATE TABLE quick_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    workspace_id text NOT NULL,
    title text NOT NULL,
    content text,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    due_date timestamp,
    user_id text NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    workspace_id text NOT NULL,
    status text
);

-- Create completed_tasks table
CREATE TABLE completed_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    due_date timestamp,
    user_id text NOT NULL,
    completed_at timestamp DEFAULT CURRENT_TIMESTAMP,
    workspace_id text NOT NULL,
    status text
);

-- Create workspaces table
CREATE TABLE workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    user_id text NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table
CREATE TABLE schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    start_time timestamp,
    end_time timestamp,
    workspace_id uuid NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create files table
CREATE TABLE files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    file_url text NOT NULL,
    workspace_id uuid NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text,
    workspace_id uuid NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```
<br />
See database.sql file for these commands

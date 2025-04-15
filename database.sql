/*
    Author - DivyanshMauryaaa (Github)
    Project - Nexora
    Created by - ByteForge inc,
    LISCENCE - Copyright © 2025 ByteForge Inc.

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

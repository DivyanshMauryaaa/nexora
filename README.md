<h1>Nexora</h1>
<p>
Nexora is a produtvitiy app that let's the user stay focused and produtive throughout the time.&#8203;
</p>

<h2>Usage Process</h2>
<ul>
  <li>Clone the repo 
    <br />
    <code>git clone https://github.com/divyanshMauryaaa/nexora</code>
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
(See /database.sql file for these commands)

<h1>Testgem</h1>
<p>
TestGem is an AI-powered web application that allows users to create customized test papers effortlessly. Leveraging artificial intelligence, it generates relevant questions based on user inputs, streamlining the assessment creation process.&#8203;
</p>

<h2>Usage Process</h2>
<ul>
  <li>Clone the repo 
    <br />
    ```bash
    git clone https://github.com/DivyanshMauryaaa/testgem
    ```
  </li>
  <li>Create .env file and load it with the structure given below. make sure to put "your" values</li>
  <li>run 
    
    ```bash
    
    npm install
    
    ``` 
    
    to install all the depedencies</li>
  <li>run 
    
    ```
    
    npm run dev
    
    ``` 
    
    in terminal to run and test the app</li>
</ul>

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

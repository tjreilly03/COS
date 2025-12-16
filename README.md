# Library App

To setup and run the app, if it is not running already, run the following commands to have it build and run the latest version

docker compose build --no-cache
docker compose up -d

This will then let you go to 
https://tylerslibrary.com/login

The database schema are as follows
users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      profile_color TEXT DEFAULT '#000000',
      avatar TEXT,
      failed_attempts INTEGER DEFAULT 0,
      lock_until INTEGER DEFAULT 0
    );
sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      expires INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      display_name TEXT,
      text TEXT,
      created_at INTEGER,
      edited_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      ip TEXT,
      success INTEGER,
      timestamp INTEGER
    );
password_resets (
      token TEXT PRIMARY KEY,
      user_id INTEGER,
      expires INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      display_name TEXT,
      message TEXT,
      timestamp INTEGER
    );
book_recs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      book_title TEXT,
      author TEXT,
      description TEXT,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );


    Env Variables
    SENDGRID_API_KEY
    This is the APU key for sendgrid, so that emails for password recovery can be used. 

    NGINX Proxy Management instructions
    Install the NGINX proxy package, and update the docker
    Added the domain host tylerslibrary.com
    The host name is my-nodejs-app
    the port number is 3000
    I enabled websockets and forced SSL.


    Email Service configuration
    I used send grid and a new gmail to configure the email.
    Send grid required an API key and an existing email that I could send from.
    I made a new gmail, tylerslibrary398 becayse tylerslibrary was taken... I'm not upset....
    and then used that email address when setting up send grid from the online dashboard.
    This then let me send from sendgrid in js.
    the only weird thing is all the emails go directly to spam. haven't figured out why. ¯\_(ツ)_/¯

    Security Features
    password hashing using argon2
    session ids and session cookies
    session expirtion
    account lockout after 5 failed attempts
    https
    xss sanitization
    duplicate email protection
    


    API endpoint
    GET /api/chat
    this requires a valid session id

    Known limitations
    Whenever a new publish is run, if the chat room was left open, it seems to duplicate all chats visually, but not actually in the db.
    When refreshing the page, it does not persist.

    Because I kept the old original site since the beginning of class, most of the first few pages are not made as well as I would have liked.
    In hindsight, I would have used Bootstrap for more than just the icons to make the pages look so much better.




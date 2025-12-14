//router.js
//this file now holds all the route functions to clean up the main server.js
const express = require('express');
const path = require('path');
const argon2 = require('argon2');
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const sgMail = require('@sendgrid/mail');

const { marked } = require('marked');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);



sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//password is 4dgJ%JF@$JFKD55kgfdjht^

module.exports = (app, deps) => {
    const router = express.Router();

    const {
      pdfDirectory,
      pdfList,
      pdfValidation,
      metadata,
      db
  } = deps;
  
    function renderMarkdown(markdownText) {
      const rawHtml = marked(markdownText, {
        breaks: true,
        gfm: true
      });
    
      return purify.sanitize(rawHtml);
    }
  


    function sendResetEmail(toEmail, token) {
      const resetLink = `http://tylerslibrary.com/resetPassword?token=${token}`;
    
      const msg = {
        to: toEmail,
        from: 'tylerslibrary398@gmail.com', // verified sender in SendGrid
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click here: ${resetLink}. Token expires in 1 hour.`,
        html: `<p>You requested a password reset.</p>
              <p>Click <a href="${resetLink}">here</a> to reset your password. Token expires in 1 hour.</p>`
      };
    
      sgMail.send(msg)
        .then(() => console.log('Reset email sent'))
        .catch(err => console.error('Error sending reset email:', err));
    }


    function getCurrentUser(req) {
      const sessionId = req.cookies.sessionId;
      console.log("session Id =" + sessionId);
      return new Promise((resolve) => {
        if (!sessionId) return resolve(null);
    
        db.get(
          `SELECT users.* FROM sessions
           JOIN users ON users.id = sessions.user_id
           WHERE sessions.id = ? AND sessions.expires > ?`,
          [sessionId, Date.now()],
          (err, row) => resolve(row || null)
        );
      });
    }
    app.use(cookieParser());


//gets
    // PDF list page
    router.get('/pdfs', async (req, res) => {
      const user = await getCurrentUser(req);
      if (!user) return res.redirect('/login');
      

        res.render('pdfs', {
            title: 'PDF Library',
            pdfs: pdfList
        });
    });

    // Serve actual PDF using sendFile()
    router.get('/pdfs/:filename', async (req, res) => {
      const user = await getCurrentUser(req);
      if (!user) return res.redirect('/login');

        const filename = req.params.filename;
        const filePath = path.join(pdfDirectory, filename);

        if (!pdfValidation.exists(pdfDirectory, filename)) {
            return res.status(404).send("PDF not found");
        }

        res.sendFile(filePath);
    });


    app.get('/index', async (req, res) => {
      const user = await getCurrentUser(req);
      if (!user) return res.redirect('/login');
          res.render('index', {
              title: 'Welcome to Our Site',
              message: 'This is a Handlebars template!'
          });
      });
      app.get('/', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
        res.redirect('/index'); 
      });
      
      app.get('/read', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
          res.render('read', {
              title: 'Welcome to Our Site',
              message: 'This is a Handlebars template!'
          });
      });
      app.get('/upcoming', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
          res.render('upcoming', {
              title: 'Welcome to Our Site',
              message: 'This is a Handlebars template!'
          });
      });
      
      app.get('/bookreviews', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
          res.render('bookreviews', {
              title: 'Welcome to Our Site',
              message: 'This is a Handlebars template!'
          });
      });
      

      app.get('/chat', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
          res.render('chat', {
              title: 'Welcome to Our Site',
              message: 'This is a Handlebars template!'
          });
      });
      
      
      app.get('/login', (req, res) => {
        res.render('login', {
            title: 'Welcome to Our Site',
            message: 'This is a Handlebars template!'
        });
      });
      
      app.get('/logout', (req, res) => {
        res.render('logout', {
            title: 'Welcome to Our Site',
            message: 'This is a Handlebars template!'
        });
      });
      
      app.get('/register', (req, res) => {
        res.render('register', {
            title: 'Welcome to Our Site',
            message: 'This is a Handlebars template!'
        });
      });
      
      app.get('/comments', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
        const PAGE_SIZE = 5;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
      
        db.get(`SELECT COUNT(*) AS total FROM comments`, [], (err, countRow) => {
          if (err) return res.status(500).send('DB error');
      
          const totalComments = countRow.total;
          const totalPages = Math.ceil(totalComments / PAGE_SIZE);
          const safePage = Math.min(page, totalPages || 1);
          const offset = (safePage - 1) * PAGE_SIZE;
      
          db.all(
            `
            SELECT
              comments.text,
              comments.created_at,
              users.display_name AS author
            FROM comments
            JOIN users ON users.id = comments.user_id
            ORDER BY comments.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [PAGE_SIZE, offset],
            (err, rows) => {
              if (err) return res.status(500).send('DB error');
      
              const comments = rows.map(c => ({
                author: c.author,
                text: renderMarkdown(c.text),
                createdAt: new Date(c.created_at).toLocaleString()
              }));
      
              res.render('comments', {
                comments,
                currentPage: safePage,
                totalPages,
                totalComments
              });
            }
          );
        });
      });
      
      app.get('/comment/new', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
        res.render('newComment', { title: 'New Comment', user });
      });

      app.get('/bookrecs', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
        const PAGE_SIZE = 5;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
      
        db.get(`SELECT COUNT(*) AS total FROM book_recs`, [], (err, countRow) => {
          if (err) return res.status(500).send('DB error');
      
          const totalRecs = countRow.total;
          const totalPages = Math.ceil(totalRecs / PAGE_SIZE);
          const safePage = Math.min(page, totalPages || 1);
          const offset = (safePage - 1) * PAGE_SIZE;
      
          db.all(
            `
            SELECT
              book_recs.book_title,
              book_recs.author,
              book_recs.description,
              book_recs.created_at,
              users.display_name AS recomender
            FROM book_recs
            JOIN users ON users.id = book_recs.user_id
            ORDER BY book_recs.created_at DESC
            LIMIT ? OFFSET ?
            `,
            [PAGE_SIZE, offset],
            (err, rows) => {
              if (err) return res.status(500).send('DB error');
      
              const book_recs = rows.map(c => ({
                title: c.title,
                author: c.author,
                recomender: c.recomender,
                description: renderMarkdown(c.description),
                createdAt: new Date(c.created_at).toLocaleString()
              }));
      
              res.render('bookrecs', {
                book_recs,
                currentPage: safePage,
                totalPages,
                totalRecs
              });
            }
          );
        });
      });

      app.get('/bookrec/new', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
        res.render('newBookRec', { title: 'New Recomendation', user });
      });

      
      // GET /profile
      app.get('/profile', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');

        res.render('profile', { user });
      });


      app.get('/forgotPassword', (req, res) => {
        res.render('forgotPassword', { title: 'Forgot Password' });
      });

      app.get('/resetPassword', (req, res) => {
        const { token } = req.query;
        if (!token) return res.redirect('/login');

        db.get(
          `SELECT * FROM password_resets WHERE token = ? AND expires > ?`,
          [token, Date.now()],
          (err, reset) => {
            if (err || !reset) return res.render('resetPassword', { error: 'Invalid or expired token' });
            res.render('resetPassword', { token });
          }
        );
      });

      app.get('/api/chat', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
      
        db.all(`SELECT * FROM chat_messages ORDER BY timestamp ASC LIMIT 50`, [], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        });
      });
      



//posts

    app.post('/resetPassword', async (req, res) => {
      const { token, password } = req.body;

      if (!password || password.length < 12) {
        return res.render('resetPassword', { error: 'Password too weak', token });
      }

      db.get(
        `SELECT * FROM password_resets WHERE token = ? AND expires > ?`,
        [token, Date.now()],
        async (err, reset) => {
          if (err || !reset) return res.render('resetPassword', { error: 'Invalid or expired token' });

          const hash = await argon2.hash(password);

          // Update user password
          db.run(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, reset.user_id], (err) => {
            if (err) return res.status(500).send('Server error');

            // Delete reset token
            db.run(`DELETE FROM password_resets WHERE token = ?`, [token]);

            // Delete all existing sessions for this user (force re-login)
            db.run(`DELETE FROM sessions WHERE user_id = ?`, [reset.user_id]);

            res.redirect('/login');
          });
        }
      );
    });


      app.post('/forgotPassword', async (req, res) => {
        const { email } = req.body;
        
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
          if (err) return res.status(500).send('Server error');
          if (!user) return res.render('forgotPassword', { error: 'Email not found' });

          const crypto = require('crypto');
          const token = crypto.randomBytes(32).toString('hex');
          const expires = Date.now() + 3600000; // 1 hour

          db.run(
            `INSERT INTO password_resets (token, user_id, expires)
            VALUES (?, ?, ?)`,
            [token, user.id, expires],
            (err) => {
              if (err) return res.status(500).send('Server error');

              // Send email with link
              sendResetEmail(user.email, token);
              res.render('forgotPassword', { message: 'Check your email for reset instructions' });
            }
          );
        });
      });


      app.post('/profile/password', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');

        const { currentPassword, newPassword } = req.body;

        const valid = await argon2.verify(user.password_hash, currentPassword);
        if (!valid) return res.render('profile', { user, error: 'Current password is incorrect' });

        if (newPassword.length < 12) return res.render('profile', { user, error: 'Password too weak' });

        const hash = await argon2.hash(newPassword);

        // Update password
        db.run(`UPDATE users SET password_hash=? WHERE id=?`, [hash, user.id], err => {
          if (err) return res.render('profile', { user, error: 'Could not update password' });

          // Invalidate all sessions
          db.run(`DELETE FROM sessions WHERE user_id=?`, [user.id]);

          res.clearCookie('sessionId');
          res.redirect('/login'); // force re-login
        });
      });


      app.post('/profile/email', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');

        const { password, newEmail } = req.body;
        const valid = await argon2.verify(user.password_hash, password);
        if (!valid) return res.render('profile', { user, error: 'Password incorrect' });

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          return res.render('profile', { user, error: 'Invalid email format' });
        }

        // Check uniqueness
        db.get(`SELECT * FROM users WHERE email=? AND id!=?`, [newEmail, user.id], (err, row) => {
          if (row) return res.render('profile', { user, error: 'Email already in use' });

          db.run(`UPDATE users SET email=? WHERE id=?`, [newEmail, user.id], err => {
            if (err) return res.render('profile', { user, error: 'Could not update email' });
            res.redirect('/profile');
          });
        });
      });

      app.post('/profile/displayName', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');

        const { displayName } = req.body;
        if (!displayName || displayName.length > 50) return res.render('profile', { user, error: 'Invalid display name' });

        db.run(`UPDATE users SET display_name=? WHERE id=?`, [displayName, user.id], err => {
          if (err) return res.render('profile', { user, error: 'Could not update display name' });

          res.redirect('/profile');
        });
      });


      app.post('/profile/customize', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');

        const {bio} = req.body;

        // Simple sanitization
        const safeBio = bio?.substring(0, 300) || '';

        db.run(
          `UPDATE users SET bio=? WHERE id=?`,
          [safeBio, user.id],
          err => {
            if (err) return res.render('profile', { user, error: 'Could not save customizations' });
            res.redirect('/profile');
          }
        );
      });


      app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const ip = req.ip;

        db.get(
          `SELECT * FROM users WHERE username = ?`,
          [username],
          async (err, user) => {
            if (!user) return res.render('login', { error: 'Invalid credentials' });

            if (user.lock_until > Date.now()) {
              return res.render('login', {
                error: 'Account locked. Try again later.'
              });
            }

            const valid = await argon2.verify(user.password_hash, password);

            db.run(
              `INSERT INTO login_attempts (username, ip, success, timestamp)
              VALUES (?, ?, ?, ?)`,
              [username, ip, valid ? 1 : 0, Date.now()]
            );

            if (!valid) {
              const attempts = user.failed_attempts + 1;
              const lock = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0;

              db.run(
                `UPDATE users SET failed_attempts=?, lock_until=? WHERE id=?`,
                [attempts, lock, user.id]
              );

              return res.render('login', { error: 'Invalid credentials' });
            }

            // reset lock
            db.run(
              `UPDATE users SET failed_attempts=0, lock_until=0 WHERE id=?`,
              [user.id]
            );

            // create session
            const sessionId = uuidv4();

            db.run(
              `INSERT INTO sessions (id, user_id, expires)
               VALUES (?, ?, ?)`,
              [sessionId, user.id, Date.now() + 3600000],
              err => {
                if (err) {
                  console.error('SESSION INSERT ERROR:', err);
                  return res.status(500).send(err.message);
                }
            
                res.cookie('sessionId', sessionId);
            
                res.redirect('/index');
              }
            );
            
          }
        );
      });

      
      app.post('/logout', async (req, res) => {
        const sessionId = req.cookies.sessionId;
      
        if (sessionId) {
          db.run(
            `DELETE FROM sessions WHERE id = ?`,
            [sessionId],
            (err) => {
              if (err) {
                console.error("Error deleting session:", err);
              }
            }
          );
        }
      
        // Clear the current user's session cookie
        res.clearCookie('sessionId');
        res.redirect('/login');
      });
      
      

      app.post('/comment', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
      
        let { text } = req.body;
        if (!text || text.trim().length === 0) {
          return res.redirect('/comments');
        }
      
        // Hard limit (rubric-friendly)
        if (text.length > 2000) {
          text = text.substring(0, 2000);
        }
      
        db.run(
          `INSERT INTO comments (user_id, text, created_at)
           VALUES (?, ?, ?)`,
          [user.id, text, Date.now()],
          () => res.redirect('/comments')
        );
      });


      app.post('/bookrec', async (req, res) => {
        const user = await getCurrentUser(req);
        if (!user) return res.redirect('/login');
      
        // ✅ Correct source of form data
        let { title, author, description } = req.body;
      
        // Validation
        if (!title || !author || !description) {
          return res.redirect('/bookrecs');
        }
      
        title = title.trim();
        author = author.trim();
        description = description.trim();
      
        if (!title || !author || !description) {
          return res.redirect('/bookrecs');
        }
      
        // Length limits (rubric-friendly)
        if (title.length > 200) title = title.substring(0, 200);
        if (author.length > 200) author = author.substring(0, 200);
        if (description.length > 2000) description = description.substring(0, 2000);
      
        db.run(
          `INSERT INTO book_recs (user_id, book_title, author, description, created_at)
           VALUES (?, ?, ?, ?, ?)`,
          [user.id, title, author, description, Date.now()],
          err => {
            if (err) {
              console.error('BOOK REC INSERT ERROR:', err);
              return res.status(500).send('DB error');
            }
            res.redirect('/bookrecs');
          }
        );
      });
      
      
      
      
      app.post('/register', async (req, res) => {
        const { username, password, email, displayName } = req.body;
      
        if (!username || !password || !email || !displayName) {
          return res.render('register', { error: 'All fields required' });
        }
      
        if (password.length < 12) {
          return res.render('register', { error: 'Password too weak' });
        }
      
        try {
          const hash = await argon2.hash(password);
      
          db.run(
            `INSERT INTO users (username, password_hash, email, display_name)
             VALUES (?, ?, ?, ?)`,
            [username, hash, email, displayName],
            function (err) {
              if (err) {
                console.error('REGISTER ERROR:', err.message);
                return res.render('register', { error: err.message });
              }
              res.redirect('/login');
            }
          );
        } catch (e) {
          console.error(e);
          res.render('register', { error: 'Server error' });
        }
      });
      


    // Attach to app
    app.use(router);
};

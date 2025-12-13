// chats.js
module.exports = (io, db) => {
    // Socket.io authentication middleware
    io.use((socket, next) => {
      try {
        const sessionCookie = socket.handshake.headers.cookie;
        const sessionId = sessionCookie
          ?.split('; ')
          .find(c => c.startsWith('sessionId='))
          ?.split('=')[1];
  
        if (!sessionId) return next(new Error('Not authenticated'));
  
        db.get(
          `SELECT users.* 
           FROM sessions 
           JOIN users ON users.id = sessions.user_id 
           WHERE sessions.id = ? AND sessions.expires > ?`,
          [sessionId, Date.now()],
          (err, user) => {
            if (err) return next(new Error('DB error'));
            if (!user) return next(new Error('Not authenticated'));
  
            socket.user = user; // attach user to socket
            next();
          }
        );
      } catch (err) {
        next(new Error('Authentication failed'));
      }
    });
  
    // Handle new socket connections
    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.user.display_name}`);
  
      // Load last 50 messages and send to client
      db.all(
        `SELECT * FROM chat_messages ORDER BY timestamp ASC LIMIT 50`,
        [],
        (err, rows) => {
          if (err) {
            console.error('Error fetching chat history:', err);
            return;
          }
          socket.emit('chatHistory', rows);
        }
      );
  
      // Listen for new chat messages
      socket.on('chatMessage', (text) => {
        if (!text || !socket.user) return;
  
        const timestamp = Date.now();
        const message = {
          user_id: socket.user.id,
          display_name: socket.user.display_name,
          message: text,
          timestamp,
        };
  
        // Save to DB
        db.run(
          `INSERT INTO chat_messages (user_id, display_name, message, timestamp) VALUES (?, ?, ?, ?)`,
          [socket.user.id, socket.user.display_name, text, timestamp],
          (err) => {
            if (err) console.error('Error saving chat message:', err);
          }
        );
  
        // Broadcast message to all connected clients
        io.emit('chatMessage', message);
      });
  
      // Handle disconnections
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.user.display_name}`);
      });
    });
  };
  
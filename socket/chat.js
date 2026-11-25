const jwt = require('jsonwebtoken');

const CHAT_ROOM = 'secure_connect_room';

/**
 * Configure Socket.IO with JWT authentication and real-time chat events.
 */
const setupSocket = (io) => {
  // Authenticate every incoming socket connection using JWT
  io.use((socket, next) => {
    try {
      const authToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null);

      if (!authToken) {
        console.log(`[SOCKET] Connection rejected: No token provided (${socket.id})`);
        return next(new Error('Authentication error: No token provided.'));
      }

      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

      // Attach verified user identity from JWT to the socket
      socket.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      console.log(`[SOCKET] Connection rejected: Invalid or expired token (${socket.id})`);
      return next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.user.name} (${socket.id})`);

    // Handle user joining the common chat room
    socket.on('join_chat', () => {
      socket.join(CHAT_ROOM);
      socket.hasJoinedChat = true;
      const timestamp = new Date().toISOString();

      console.log(`[SOCKET] ${socket.user.name} joined room: ${CHAT_ROOM}`);

      io.to(CHAT_ROOM).emit('user_joined', {
        userName: socket.user.name,
        message: `${socket.user.name} joined the chat`,
        timestamp,
      });
    });

    // Handle incoming chat messages
    socket.on('send_message', (data) => {
      const messageText = typeof data === 'string' ? data : data?.message;

      if (!messageText || !messageText.trim()) {
        return;
      }

      if (!socket.hasJoinedChat) {
        socket.join(CHAT_ROOM);
        socket.hasJoinedChat = true;
      }

      const cleanMessage = messageText.trim();
      const timestamp = new Date().toISOString();

      console.log(`[SOCKET] Message from ${socket.user.name}: "${cleanMessage}" (${timestamp})`);

      // Always use verified JWT identity, never trust client-supplied username
      io.to(CHAT_ROOM).emit('receive_message', {
        senderId: socket.user.id,
        senderName: socket.user.name,
        message: cleanMessage,
        timestamp,
      });
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${socket.user.name} (${socket.id})`);

      if (socket.hasJoinedChat) {
        io.to(CHAT_ROOM).emit('user_left', {
          userName: socket.user.name,
          message: `${socket.user.name} left the chat`,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });
};

module.exports = setupSocket;

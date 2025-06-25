import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('new-comment', (data) => {
    // Broadcast ke semua client kecuali pengirim
    socket.broadcast.emit('new-comment', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

httpServer.listen(3001, () => {
  console.log('🚀 Socket.IO server running at http://localhost:3001');
});

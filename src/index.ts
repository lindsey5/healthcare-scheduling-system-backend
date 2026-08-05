import app from './app';
import dotenv from 'dotenv';
import { createServer } from "http";
import { connectDB } from './config/db';
import initializeSocket from './sockets/socket';
dotenv.config();

const PORT = process.env.PORT || 3000; 

connectDB();

const server = createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log('Server running on port', PORT);
})
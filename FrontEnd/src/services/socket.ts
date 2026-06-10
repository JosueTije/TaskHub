import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL as string;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}

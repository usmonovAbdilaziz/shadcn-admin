// lib/socket-client.ts
import { io, type Socket } from "socket.io-client";

declare global {
  // HMR/strict mode paytida bitta instance ushlab turish uchun
  // eslint-disable-next-line no-var
  var __clientSocket: Socket | undefined;
}

const URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3002";
const NAMESPACE = "/socket";

export const socket: Socket =
  globalThis.__clientSocket ??
  io(`${URL}${NAMESPACE}`, {
    transports: ["polling", "websocket"],
    autoConnect: false,
    withCredentials: true,
  });

if (!globalThis.__clientSocket) globalThis.__clientSocket = socket;
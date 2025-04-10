import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket(serverUrl) {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(serverUrl);
    return () => socket.current.disconnect();
  }, [serverUrl]);

  return socket;
}
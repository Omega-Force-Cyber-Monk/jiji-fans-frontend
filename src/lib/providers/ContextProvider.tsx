"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { message } from "antd";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import type { MessageInstance } from "antd/es/message/interface";
import { socketUrl } from "@/config";
import { useDispatch } from "react-redux";
import { baseApi } from "@/redux/api/baseApi";

type AppContextType = {
  socket: Socket | null;
  messageApi: MessageInstance;
  reconnect: () => void;
};

type ContextProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const dispatch = useDispatch();

  const reconnect = () => {
    setReconnectCount((prev) => prev + 1);
  };

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      setSocket(null);
      return;
    }

    const socketData = io(socketUrl, {
      transports: ["websocket"],
      auth: { token: token },
    });
    socketData.on("connect", () => {
      setSocket(socketData);
    });
    socketData.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socketData.disconnect();
    };
  }, [reconnectCount]);
  useEffect(() => {
    if (!socket) return;
    const handler = (res: any) => {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isMessagesPage = pathname.startsWith("/messages/");
      const activeConversationId = isMessagesPage
        ? pathname.replace("/messages/", "").split("/")[0]
        : null;
      const incomingConversationId =
        res?.conversationId ||
        (typeof res?.conversation === "string"
          ? res.conversation
          : res?.conversation?._id);
      dispatch(baseApi.util.invalidateTags(["conversation", "message"]));
      if (!isMessagesPage || activeConversationId !== incomingConversationId) {
        messageApi.info("New Message received. Please check inbox.");
      }
    };
    socket.on("new-message", handler);
    return () => {
      socket.off("new-message", handler);
    };
  }, [socket, messageApi, dispatch]);
  // console.log(socket)
  return (
    <AppContext.Provider value={{ socket, messageApi, reconnect }}>
      {contextHolder}
      {children}
    </AppContext.Provider>
  );
};

export default ContextProvider;

const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return context;
};

export { useAppContext };

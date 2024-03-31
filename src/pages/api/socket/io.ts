import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types/type";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("create-room", (fieldId) => {
        console.log("Room is created");
        socket.join(fieldId);
      });
      socket.on("send-changed-text", (deltas, fieldId) => {
        console.log("CHANGE");
        socket.to(fieldId).emit("receive-changed-text", deltas, fieldId);
      });
      socket.on("send-cursor-move", (range, fieldId, cursorId) => {
        socket
          .to(fieldId)
          .emit("receive-cursor-move", range, fieldId, cursorId);
      });
    });
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default ioHandler;

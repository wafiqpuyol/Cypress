import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types/type";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket/io/",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("create-room", (fileId) => {
        console.log("Room is created");
        socket.join(fileId);
      });
      socket.on("send-changes", (deltas, fileId) => {
        console.log("CHANGE");
        socket.to(fileId).emit("receive-changes", deltas, fileId);
      });
      socket.on("send-cursor-move", (range, fileId, cursorId) => {
        socket.to(fileId).emit("receive-cursor-move", range, fileId, cursorId);
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

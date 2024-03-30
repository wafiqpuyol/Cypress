import {
  appFoldersType,
  appWorkspacesType,
} from "@/lib/providers/state-providers";
import { File } from "@/lib/supabase/schema-type";
import { Socket, Server as NetServer } from "net";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
export type Action =
  | { type: "ADD_WORKSPACE"; payload: appWorkspacesType }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | {
      type: "UPDATE_WORKSPACE";
      payload: { workspace: Partial<appWorkspacesType>; workspaceId: string };
    }
  | {
      type: "SET_WORKSPACES";
      payload: { workspaces: appWorkspacesType[] | [] };
    }
  | {
      type: "SET_FOLDERS";
      payload: { workspaceId: string; folders: [] | appFoldersType[] };
    }
  | {
      type: "ADD_FOLDER";
      payload: { workspaceId: string; folder: appFoldersType };
    }
  | {
      type: "ADD_FILE";
      payload: { workspaceId: string; file: File; folderId: string };
    }
  | {
      type: "DELETE_FILE";
      payload: { workspaceId: string; folderId: string; fileId: string };
    }
  | {
      type: "DELETE_FOLDER";
      payload: { workspaceId: string; folderId: string };
    }
  | {
      type: "SET_FILES";
      payload: { workspaceId: string; files: File[]; folderId: string };
    }
  | {
      type: "UPDATE_FOLDER";
      payload: {
        folder: Partial<appFoldersType>;
        workspaceId: string;
        folderId: string;
      };
    }
  | {
      type: "UPDATE_FILE";
      payload: {
        file: Partial<File>;
        folderId: string;
        workspaceId: string;
        fileId: string;
      };
    };

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

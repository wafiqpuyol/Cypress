"use server";

import db from "./db";
import { workspaces, folders, files, users } from "../../../migrations/schema";
import { Folder, User, Workspace, File } from "./schema-type";
import { and, eq, ilike, notExists } from "drizzle-orm";
import { collaborators } from "@/lib/supabase/schema";

export const userSubscriptionStatus = async (userId: string) => {
  try {
    const query = await db.query.subscriptions.findFirst({
      where: (subscription, { eq }) => eq(subscription.userId, userId),
    });
    if (!query) return { data: null, error: null };
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const findFirstWorkspace = async (userId: string) => {
  try {
    const query = await db.query.workspaces.findFirst({
      where: (workspace, { eq }) => eq(workspace.workspaceOwner, userId),
    });
    if (!query) return { data: null, error: null };
    return { data: query, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const createWorkspace = async (
  workspace: Workspace
): Promise<{ data: Workspace | null; error: any }> => {
  try {
    const query = await db.insert(workspaces).values(workspace).returning();
    return { data: query[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const createUser = async (data: any) => {
  await db.insert(users).values(data);
};

export const createFolder = async (
  folder: Folder
): Promise<{ data: Folder[] | []; error: any }> => {
  try {
    const query = await db.insert(folders).values(folder).returning();
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};
export const getFolders = async (
  workspaceId: string
): Promise<{ data: Folder[] | []; error: any }> => {
  try {
    const query = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const getPrivateWorkspaces = async (
  userId: string
): Promise<{ data: Workspace[] | []; error: any | null }> => {
  try {
    const query = await db
      .select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(workspaces)
      .where(
        and(
          notExists(
            db
              .select()
              .from(collaborators)
              .where(eq(collaborators.workspaceId, workspaces.id))
          ),
          eq(workspaces.workspaceOwner, userId)
        )
      );
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const getCollaboratingWorkspaces = async (
  userId: string
): Promise<{ data: Workspace[] | []; error: any | null }> => {
  try {
    const query = await db
      .select({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(users)
      .innerJoin(collaborators, eq(users.id, collaborators.userId))
      .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
      .where(eq(users.id, userId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const getSharedWorkspaces = async (
  userId: string
): Promise<{ data: Workspace[] | []; error: any | null }> => {
  try {
    const query = await db
      .selectDistinct({
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
      })
      .from(workspaces)
      .orderBy(workspaces.createdAt)
      .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
      .where(eq(workspaces.workspaceOwner, userId));
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const getFiles = async (
  folderId: string
): Promise<{ data: File[] | []; error: any }> => {
  try {
    const results = await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId));
    return { data: results, error: null };
  } catch (error) {
    return { data: [], error: "Error" };
  }
};

export const getUsersByEmail = async (
  email: string
): Promise<{ data: User[] | string; error: any }> => {
  try {
    const accounts = await db
      .select()
      .from(users)
      .where(ilike(users.email, `${email}%`));
    return { data: accounts, error: null };
  } catch (error: any) {
    return { data: "No user found", error: error.message };
  }
};

export const addWorkspaceCollaborator = async (
  users: User[],
  workspaceId: string
) => {
  try {
    users.forEach(async (user) => {
      const existingUser = await db.query.collaborators.findFirst({
        where: (collaborator, { eq }) =>
          and(
            eq(collaborator.userId, user.id),
            eq(collaborator.workspaceId, workspaceId)
          ),
      });
      if (!existingUser) {
        await db.insert(collaborators).values({ userId: user.id, workspaceId });
      }
    });
    return { data: "success", error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateFolder = async (
  updatedField: Partial<Folder>,
  folderId: string
) => {
  try {
    const query = await db
      .update(folders)
      .set(updatedField)
      .where(eq(folders.id, folderId))
      .returning();
    console.log(query);
    return { data: query[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateFile = async (
  updatedField: Partial<File>,
  fileId: string
) => {
  try {
    const query = await db
      .update(files)
      .set(updatedField)
      .where(eq(files.id, fileId))
      .returning();
    return { data: query[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getUserById = async (workspaceOwnerId: string) => {
  try {
    const isWorkspaceExist = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.workspaceOwner, workspaceOwnerId));
    if (!isWorkspaceExist.length) {
      throw new Error("This id does not have it's own workspace");
    }

    const query = await db
      .select()
      .from(users)
      .where(eq(users.id, isWorkspaceExist[0].workspaceOwner));
    return { data: query[0], error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateWorkspace = async (
  workspaceUpdateData: Partial<Workspace>,
  workspaceId: string
) => {
  try {
    await db
      .update(workspaces)
      .set(workspaceUpdateData)
      .where(eq(workspaces.id, workspaceId));
    return { data: null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
export const addCollaborators = async (users: User[], workspaceId: string) => {
  try {
    users.forEach(async (user: User) => {
      try {
        const existingUser = await db.query.collaborators.findFirst({
          where: (collaborator, { eq }) =>
            and(
              eq(collaborator.userId, user.id),
              eq(collaborator.workspaceId, workspaceId)
            ),
        });

        if (!existingUser) {
          await db
            .insert(collaborators)
            .values({ workspaceId, userId: user.id });
        }
      } catch (error) {
        throw new Error();
      }
    });
    return { data: "Success", error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const removeCollaborators = async (
  users: User[],
  workspaceId: string
) => {
  try {
    users.forEach(async (user: User) => {
      try {
        const existingUser = await db.query.collaborators.findFirst({
          where: (collaborator, { eq }) =>
            and(
              eq(collaborator.userId, user.id),
              eq(collaborator.workspaceId, workspaceId)
            ),
        });

        if (existingUser) {
          await db
            .delete(collaborators)
            .where(
              and(
                eq(collaborators.userId, existingUser.id),
                eq(collaborators.workspaceId, existingUser.workspaceId)
              )
            );
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
    });

    return { data: "Success", error: null };
  } catch (error: any) {
    return { data: null, error: error?.message || error };
  }
};

export const getCollaborators = async (workspaceId: string) => {
  try {
    const query = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.workspaceId, workspaceId));

    if (!query.length) {
      return { data: null, error: null };
    }

    const users = (
      await Promise.all(
        query.map((collaborator) => {
          const existedUser = db.query.users.findFirst({
            where: (user, { eq }) => eq(user.id, collaborator.userId),
          });
          return existedUser;
        })
      )
    ).filter((user) => user != undefined) as User[];

    return { data: users, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const getActiveProductsWithPrice = async () => {
  try {
    const query = await db.query.products.findMany({
      where: (product, { eq }) => eq(product.active, true),
      /**
       * TODO include price information from price table
       */
    });
    return { data: query, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

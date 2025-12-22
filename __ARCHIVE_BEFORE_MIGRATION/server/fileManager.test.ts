import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("fileManager router", () => {
  it("should upload a file successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small test file (1KB base64 string)
    const testFileData = Buffer.from("test file content").toString("base64");

    const result = await caller.fileManager.upload({
      fileName: "test.txt",
      fileData: testFileData,
      mimeType: "text/plain",
      module: "CEO",
      description: "Test file upload",
    });

    expect(result.success).toBe(true);
    expect(result.fileUrl).toBeDefined();
    expect(result.fileId).toBeDefined();
    expect(result.message).toBe("ფაილი წარმატებით აიტვირთა");
  });

  it("should reject files larger than 10MB", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a file larger than 10MB (11MB)
    const largeFileData = Buffer.alloc(11 * 1024 * 1024, "a").toString("base64");

    await expect(
      caller.fileManager.upload({
        fileName: "large-file.txt",
        fileData: largeFileData,
        mimeType: "text/plain",
        module: "CEO",
      })
    ).rejects.toThrow("ფაილის ზომა აჭარბებს 10MB ლიმიტს");
  });

  it("should list uploaded files", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const files = await caller.fileManager.list({ module: "CEO" });

    expect(Array.isArray(files)).toBe(true);
    // Files array might be empty if no files uploaded yet
    if (files.length > 0) {
      expect(files[0]).toHaveProperty("id");
      expect(files[0]).toHaveProperty("fileName");
      expect(files[0]).toHaveProperty("fileUrl");
      expect(files[0]).toHaveProperty("fileSize");
      expect(files[0]).toHaveProperty("mimeType");
    }
  });

  it("should get file by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First upload a file
    const testFileData = Buffer.from("test content").toString("base64");
    const uploadResult = await caller.fileManager.upload({
      fileName: "test-get.txt",
      fileData: testFileData,
      mimeType: "text/plain",
      module: "CEO",
    });

    // Then get it by ID
    const file = await caller.fileManager.getById({
      fileId: uploadResult.fileId,
    });

    expect(file).toBeDefined();
    expect(file?.fileName).toBe("test-get.txt");
    expect(file?.mimeType).toBe("text/plain");
  });

  it("should delete a file", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First upload a file
    const testFileData = Buffer.from("test delete").toString("base64");
    const uploadResult = await caller.fileManager.upload({
      fileName: "test-delete.txt",
      fileData: testFileData,
      mimeType: "text/plain",
      module: "CEO",
    });

    // Then delete it
    const deleteResult = await caller.fileManager.delete({
      fileId: uploadResult.fileId,
    });

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.message).toBe("ფაილი წარმატებით წაიშალა");

    // Verify it's deleted
    const file = await caller.fileManager.getById({
      fileId: uploadResult.fileId,
    });
    expect(file).toBeNull();
  });

  it("should not allow deleting another user's file", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Upload a file as user 1
    const testFileData = Buffer.from("test").toString("base64");
    const uploadResult = await caller.fileManager.upload({
      fileName: "test.txt",
      fileData: testFileData,
      mimeType: "text/plain",
      module: "CEO",
    });

    // Try to delete as user 2
    const user2: AuthenticatedUser = {
      id: 2,
      openId: "test-user-2",
      email: "test2@example.com",
      name: "Test User 2",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx2: TrpcContext = {
      user: user2,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.fileManager.delete({
        fileId: uploadResult.fileId,
      })
    ).rejects.toThrow("არ გაქვთ ამ ფაილის წაშლის უფლება");
  });
});

import { google } from 'googleapis';

// Initialize Google Drive client
let driveClient: ReturnType<typeof google.drive> | null = null;

function getDriveClient() {
  if (!driveClient && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      driveClient = (google as any).drive({ version: 'v3', auth });
    } catch (error) {
      console.warn('[Google Drive] Failed to initialize client:', error);
      return null;
    }
  }
  return driveClient;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
}

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  folderId?: string,
  pageSize: number = 20,
  pageToken?: string
): Promise<{
  files: DriveFile[];
  nextPageToken?: string;
  error?: string;
}> {
  const client = getDriveClient();

  if (!client) {
    console.warn('[Google Drive] Client not initialized - using mock data');
    return getMockDriveFiles();
  }

  try {
    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : "trashed = false and 'root' in parents";

    const response = await (client.files.list({
      q: query,
      pageSize,
      pageToken,
      fields:
        'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink)',
      orderBy: 'modifiedTime desc',
    }) as any);

    return {
      files: (response.data.files || []) as DriveFile[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  } catch (error) {
    console.error('[Google Drive] Error listing files:', error);
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadToDrive(
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer,
  folderId?: string
): Promise<{
  success: boolean;
  file?: DriveFile;
  error?: string;
}> {
  const client = getDriveClient();

  if (!client) {
    return {
      success: false,
      error: 'Drive client not configured',
    };
  }

  try {
    const fileMetadata: any = {
      name: fileName,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType,
      body: require('stream').Readable.from(fileBuffer),
    };

    const response = await (client.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink',
    }) as any);

    return {
      success: true,
      file: response.data as DriveFile,
    };
  } catch (error) {
    console.error('[Google Drive] Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download file from Google Drive
 */
export async function downloadFromDrive(
  fileId: string
): Promise<{
  success: boolean;
  data?: Buffer;
  mimeType?: string;
  error?: string;
}> {
  const client = getDriveClient();

  if (!client) {
    return {
      success: false,
      error: 'Drive client not configured',
    };
  }

  try {
    // Get file metadata first
    const metadataResponse = await (client.files.get({
      fileId,
      fields: 'mimeType',
    }) as any);

    // Download file content
    const response = await (client.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'arraybuffer' }
    ) as any);

    return {
      success: true,
      data: Buffer.from(response.data as ArrayBuffer),
      mimeType: metadataResponse.data.mimeType || undefined,
    };
  } catch (error) {
    console.error('[Google Drive] Error downloading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete file from Google Drive
 */
export async function deleteFromDrive(
  fileId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getDriveClient();

  if (!client) {
    return {
      success: false,
      error: 'Drive client not configured',
    };
  }

  try {
    await client.files.delete({
      fileId,
    });

    return { success: true };
  } catch (error) {
    console.error('[Google Drive] Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create folder in Google Drive
 */
export async function createDriveFolder(
  folderName: string,
  parentFolderId?: string
): Promise<{
  success: boolean;
  folder?: DriveFile;
  error?: string;
}> {
  const client = getDriveClient();

  if (!client) {
    return {
      success: false,
      error: 'Drive client not configured',
    };
  }

  try {
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await (client.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, createdTime, modifiedTime, webViewLink',
    }) as any);

    return {
      success: true,
      folder: response.data as DriveFile,
    };
  } catch (error) {
    console.error('[Google Drive] Error creating folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mock data for development
function getMockDriveFiles(): {
  files: DriveFile[];
  nextPageToken?: string;
} {
  return {
    files: [
      {
        id: '1abc',
        name: 'ORBI_Financial_Report_2024.xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 45632,
        createdTime: '2024-01-15T10:30:00Z',
        modifiedTime: '2024-11-20T14:22:00Z',
        webViewLink: 'https://drive.google.com/file/d/1abc/view',
      },
      {
        id: '2def',
        name: 'Marketing_Campaign_Q4.pdf',
        mimeType: 'application/pdf',
        size: 1234567,
        createdTime: '2024-10-01T09:00:00Z',
        modifiedTime: '2024-11-15T16:45:00Z',
        webViewLink: 'https://drive.google.com/file/d/2def/view',
      },
      {
        id: '3ghi',
        name: 'Guest_Photos',
        mimeType: 'application/vnd.google-apps.folder',
        createdTime: '2024-09-01T08:00:00Z',
        modifiedTime: '2024-11-25T12:00:00Z',
        webViewLink: 'https://drive.google.com/drive/folders/3ghi',
      },
    ],
  };
}


// Browser-native File System Access API types
interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    getFileHandle(name: string): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle extends FileSystemHandle {
    getFile(): Promise<File>;
}

export async function getVaultFiles(dirHandle: any): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    async function scanDir(dir: any, path: string) {
        for await (const entry of dir.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                const file = await entry.getFile();
                const text = await file.text();
                // Store file content keyed by relative path (remove leading slash if present)
                const fullPath = path ? `${path}/${entry.name}` : entry.name;
                files[fullPath] = text;
            } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
                // Recursively scan, skipping hidden folders like .obsidian
                const newPath = path ? `${path}/${entry.name}` : entry.name;
                await scanDir(entry, newPath);
            }
        }
    }

    await scanDir(dirHandle, '');
    return files;
}

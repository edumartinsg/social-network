export interface FileStorage {
  upload(params: { buffer: Buffer; fileName: string; contentType: string }): Promise<string>
}

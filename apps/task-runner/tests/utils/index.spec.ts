import * as Utils from '@/task-runner/utils';
import { createZipArchive } from '@/task-runner/utils/archive-utils';
import { uploadFile } from '@/task-runner/utils/file-upload-util';
import { exportModelToCSV } from '@/task-runner/utils/model-to-csv';

describe('Utils Index Exports', () => {
  it('should export createZipArchive function', () => {
    expect(Utils.createZipArchive).toBe(createZipArchive);
  });

  it('should export uploadFile function', () => {
    expect(Utils.uploadFile).toBe(uploadFile);
  });

  it('should export exportModelToCSV function', () => {
    expect(Utils.exportModelToCSV).toBe(exportModelToCSV);
  });

  it('should export ZipFile type', () => {
    const zipFile: Utils.ZipFile | undefined = undefined;
    expect(zipFile).toBeUndefined();
  });
});

export function getFileExtension(file: File): string {
  let fileExtension = file.name.split('.').at(-1);
  fileExtension = fileExtension ? `.${fileExtension}` : '';
  return fileExtension;
}

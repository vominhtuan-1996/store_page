import mammoth from 'mammoth';

export async function readDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

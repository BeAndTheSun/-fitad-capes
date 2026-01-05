import crypto from 'crypto';

const ALGORITHM = 'aes256';
const INPUT_ENCODING = 'utf8';
const OUTPUT_ENCODING = 'hex';
const IV_LENGTH = 16; // AES blocksize

/**
 *
 * @param text Value to be encrypted
 * @param key Key used to encrypt value must be 32 bytes for AES256 encryption algorithm
 *
 * @returns Encrypted value using key
 */
export const symmetricEncrypt = (text: string, key: string): string => {
  const bufferKey = Buffer.from(key, 'latin1');
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, bufferKey, iv);
  let ciphered = cipher.update(text, INPUT_ENCODING, OUTPUT_ENCODING);
  ciphered += cipher.final(OUTPUT_ENCODING);
  const ciphertext = `${iv.toString(OUTPUT_ENCODING)}:${ciphered}`;

  return ciphertext;
};

/**
 *
 * @param text Value to decrypt
 * @param key Key used to decrypt value must be 32 bytes for AES256 encryption algorithm
 */
export const symmetricDecrypt = (text: string, key: string): string => {
  const bufferKey = Buffer.from(key, 'latin1');

  const components = text.split(':');
  const ivFromCiphertext = Buffer.from(
    components.shift() || '',
    OUTPUT_ENCODING
  );
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    bufferKey,
    ivFromCiphertext
  );
  let deciphered = decipher.update(
    components.join(':'),
    OUTPUT_ENCODING,
    INPUT_ENCODING
  );
  deciphered += decipher.final(INPUT_ENCODING);

  return deciphered;
};

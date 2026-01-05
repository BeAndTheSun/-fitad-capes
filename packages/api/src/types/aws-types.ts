export type ObjectUrlSettings = {
  // passing the same `signingDate` and `expirationTime` will return the same link, which can be cached by the browser
  signingDate?: Date;
  // link expiration time in seconds, counted from the `signingDate`
  expirationTime?: number;
};

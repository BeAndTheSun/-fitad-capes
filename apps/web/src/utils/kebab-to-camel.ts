const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
};

export { kebabToCamel };

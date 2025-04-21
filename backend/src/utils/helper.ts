export const convertCamelCaseToReadableFormat = (
  camelCaseText: string
): string => {
  // Use a regular expression to find positions where a lowercase letter is followed by an uppercase letter.
  const spacedText = camelCaseText.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Convert the entire text to lowercase and capitalize only the first character of the first word.
  return spacedText.charAt(0).toUpperCase() + spacedText.slice(1).toLowerCase();
};

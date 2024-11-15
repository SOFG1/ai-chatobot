//This function extracts footnote number from square brackets
export const getFootnoteNumber = (val: string): string => {
  return val.slice(1, val.length - 1)
}

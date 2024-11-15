export const generateRandomColor = () => {
  const hexColor =
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  return hexColor
}

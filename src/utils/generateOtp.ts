const generateOtp = (length = 6) => {
  const max = Number("1".padEnd(length + 1, "0"));
  return `${Math.floor(Math.random() * max)}`.padStart(length, "0");
};

export { generateOtp };

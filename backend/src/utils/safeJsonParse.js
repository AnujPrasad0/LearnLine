function safeJsonParse(data) {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (err) {
    console.error("Invalid JSON received:", data);
    throw new Error("Failed to parse AI JSON output");
  }
}

module.exports = safeJsonParse;

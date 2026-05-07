require("dotenv").config();

const AI_ENABLED = process.env.AI_MODERATION_ENABLED !== "false";
const AI_URL = process.env.AI_MODERATION_URL || "http://localhost:5002";
const AI_KEY = process.env.AI_MODERATION_API_KEY || "";

async function moderateImage(imageBuffer, mimeType) {
  if (!AI_ENABLED) {
    console.warn("⚠️  AI moderation DISABLED — all images approved.");
    return { safe: true, confidence: 1.0, reason: "moderation_disabled" };
  }
  try {
    // When your AI service is ready, implement the real call here
    return { safe: true, confidence: 1.0, reason: "moderation_disabled" };
  } catch (err) {
    console.error("AI image moderation error:", err.message);
    return {
      safe: true,
      confidence: 0,
      reason: "ai_service_unavailable_fallback",
      needsManualReview: true,
    };
  }
}

async function moderateText(text) {
  if (!AI_ENABLED) {
    console.warn("⚠️  AI moderation DISABLED — all text approved.");
    return { safe: true, confidence: 1.0, reason: "moderation_disabled" };
  }
  try {
    // When your AI service is ready, implement the real call here
    return { safe: true, confidence: 1.0, reason: "moderation_disabled" };
  } catch (err) {
    console.error("AI text moderation error:", err.message);
    return {
      safe: true,
      confidence: 0,
      reason: "ai_service_unavailable_fallback",
      needsManualReview: true,
    };
  }
}

module.exports = { moderateImage, moderateText };

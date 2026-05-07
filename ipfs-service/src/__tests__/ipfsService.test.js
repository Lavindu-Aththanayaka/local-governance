// src/__tests__/ipfsService.test.js
// =============================================
// UNIT / INTEGRATION TESTS
// =============================================
// Run with: npm test
// These tests use a mock IPFS client so they work without
// a real IPFS daemon running.

const request = require("supertest");
const app = require("../index");

// Mock the IPFS client so tests don't need a real IPFS node
jest.mock("../config/ipfs", () => ({
  getIPFSClient: jest.fn().mockResolvedValue({
    version: jest.fn().mockResolvedValue({ version: "0.22.0" }),
    add: jest.fn().mockResolvedValue({
      cid: {
        toString: () =>
          "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      },
      size: 1234,
    }),
    cat: jest.fn().mockImplementation(function* () {
      yield Buffer.from(
        JSON.stringify({
          version: "1.0",
          title: "Test report",
          description: "Test description",
          category: "general",
          location: null,
          imageCID: null,
          submittedAt: new Date().toISOString(),
        }),
      );
    }),
    files: {
      stat: jest.fn().mockResolvedValue({ cid: "bafybeigdyrzt5..." }),
    },
    pin: {
      add: jest.fn().mockResolvedValue({}),
      rm: jest.fn().mockResolvedValue({}),
    },
  }),
}));

// Mock AI moderation to always approve in tests
jest.mock("../utils/moderationUtils", () => ({
  moderateImage: jest.fn().mockResolvedValue({
    safe: true,
    confidence: 0.99,
    reason: "mocked_safe",
  }),
  moderateText: jest.fn().mockResolvedValue({
    safe: true,
    confidence: 0.99,
    reason: "mocked_safe",
  }),
}));

describe("GET /api/ipfs/health", () => {
  it("should return healthy status", async () => {
    const res = await request(app).get("/api/ipfs/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("healthy");
  });
});

describe("POST /api/ipfs/upload-image", () => {
  it("should reject request with no file", async () => {
    const res = await request(app).post("/api/ipfs/upload-image");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("NO_FILE");
  });

  it("should upload an image and return CID", async () => {
    // Create a minimal valid JPEG buffer (magic bytes)
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const res = await request(app)
      .post("/api/ipfs/upload-image")
      .attach("image", jpegBuffer, {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.cid).toBeDefined();
  });
});

describe("POST /api/ipfs/upload-report", () => {
  it("should reject if title is missing", async () => {
    const res = await request(app)
      .post("/api/ipfs/upload-report")
      .send({ description: "A description" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING_FIELDS");
  });

  it("should upload report metadata and return metadataCID", async () => {
    const res = await request(app)
      .post("/api/ipfs/upload-report")
      .send({
        title: "Broken streetlight",
        description: "The streetlight near the bus stop is broken.",
        category: "streetlight",
        location: { lat: 6.0535, lng: 80.221 },
        reporterPseudoId: "usr_test123",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.metadataCID).toBeDefined();
    expect(res.body.nextStep).toContain("metadataCID");
  });
});

describe("GET /api/ipfs/report/:cid", () => {
  it("should return report JSON for a valid CID", async () => {
    const res = await request(app).get(
      "/api/ipfs/report/bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test report");
  });
});

describe("POST /api/ipfs/verify", () => {
  it("should return exists true for a known CID", async () => {
    const res = await request(app)
      .post("/api/ipfs/verify")
      .send({
        cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      });
    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(true);
  });

  it("should return 400 if cid is missing", async () => {
    const res = await request(app).post("/api/ipfs/verify").send({});
    expect(res.status).toBe(400);
  });
});

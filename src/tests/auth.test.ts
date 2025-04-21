import request from "supertest";
import app from "../app";

describe("Auth API", () => {
  it("should return validation error when fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "user@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("All fields (email, password, firstName, lastName, role) are required");
  });

  it("should register a user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@eexample.com",
        password: "123456",
        firstName: "Joehn",
        lastName: "Doee",
        role: "user",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  it("should return localized error in Arabic", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Accept-Language", "ar")
      .send({ email: "user@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("يجب ملء جميع الحقول");
  });
});

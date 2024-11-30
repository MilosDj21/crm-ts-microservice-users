import { Application } from "express";
import request from "supertest";
import authService from "../../src/services/auth";
import { UnauthorizedError } from "../../src/middlewares/CustomError";
import { createApp } from "../../src/createApp";

jest.mock("../../src/services/auth"); // Automatically replaces all exports in `userService` with Jest mock functions

describe("Auth Controller - Login", () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it("should return 200 and a token for valid credentials", async () => {
    jest.spyOn(authService, "login").mockResolvedValue("fake-token");

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data", "fake-token");
    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
    );
  });

  it("should return 400 when email is missing", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "All fields must be filled");
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "All fields must be filled");
  });

  it("should return 401 for invalid credentials", async () => {
    jest
      .spyOn(authService, "login")
      .mockRejectedValue(new UnauthorizedError("Credentials not correct"));

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Credentials not correct");
    expect(authService.login).toHaveBeenCalledWith(
      "test@example.com",
      "wrongpassword",
    );
  });
});

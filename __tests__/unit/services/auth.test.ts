import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import jwt from "jsonwebtoken";

import AuthService from "../../../src/services/auth";
import { Repository } from "typeorm";
import User from "../../../src/entity/User";

jest.mock("bcrypt");
jest.mock("otplib");
jest.mock("jsonwebtoken");

describe("Auth Service - login", () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeAll(() => {
    userRepository = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
    authService = new AuthService(userRepository);
    process.env.JWT_SECRET = "jwtSecret";
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user object when login is successful", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashedPassword",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      secret: "twoFaSecret",
    };

    userRepository.findOneBy.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authenticator.verify as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("fakeJwtToken");

    const user = await authService.login(
      "test@example.com",
      "password123",
      "twoFaToken",
    );

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
    expect(authenticator.verify).toHaveBeenCalledWith({
      token: "twoFaToken",
      secret: "twoFaSecret",
    });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "jwtSecret", {
      expiresIn: 3 * 24 * 60 * 60,
    });
    expect(user).toMatchObject({
      id: 1,
      email: "test@example.com",
      firstName: "firstName",
      lastName: "lastName",
      profileImage: "imagePath",
      jwtToken: "fakeJwtToken",
    });
  });
});

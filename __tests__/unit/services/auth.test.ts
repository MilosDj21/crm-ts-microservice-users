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

  it("should throw UnauthorizedError when email is not correct", async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(new UnauthorizedError("Credentials not correct"));

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
  });

  it("should throw UnauthorizedError when password is not correct", async () => {
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
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(new UnauthorizedError("Credentials not correct"));

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashedPassword",
    );
  });

  it("should throw UnauthorizedError when two fa token is not correct", async () => {
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
    (authenticator.verify as jest.Mock).mockReturnValue(false);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(
      new UnauthorizedError("Credentials not correct", "Two FA not valid"),
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
  });

  it("should throw Error when creating JWT fails", async () => {
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
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(null);

    await expect(
      authService.login("test@example.com", "password123", "twoFaToken"),
    ).rejects.toThrow(Error("Creating jwt failed"));

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
  });
});

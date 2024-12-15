import qrcode from "qrcode";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import { isEmail, isStrongPassword } from "validator";
import { In, Repository } from "typeorm";

import User from "../entity/User";
import { BadRequestError } from "../middlewares/CustomError";
import Role from "../entity/Role";

class UserService {
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;

  constructor(
    userRepository: Repository<User>,
    roleRepository: Repository<Role>,
  ) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  saveOne = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    profileImage: string,
    roleIds: Array<number>,
  ) => {
    if (!isEmail(email)) throw new BadRequestError("Not a valid email!");
    if (!isStrongPassword(password))
      throw new BadRequestError("Password not strong enough!");

    const exist = await this.userRepository.findOneBy({ email });
    if (exist) throw new BadRequestError("Email already in use!");

    const roles = await this.roleRepository.findBy({ id: In(roleIds) });
    if (!roles) throw new BadRequestError("Non existent roles!");

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, "Imaginary CRM", secret);
    let imageQr = "";
    qrcode.toDataURL(
      otpauth,
      (error: Error | null | undefined, imageUrl: string) => {
        if (error) {
          console.log(error);
          return;
        }
        imageQr = imageUrl;
      },
    );

    const user = await this.userRepository.save({
      email,
      password: hashPassword,
      firstName,
      lastName,
      profileImage,
      secret,
      roles,
    });
    if (!user) throw new Error("Failed to save user to the db");

    return imageQr;
  };
}

export default UserService;

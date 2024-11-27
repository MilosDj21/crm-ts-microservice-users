import qrcode from "qrcode";
import { authenticator } from "otplib";

import AppDataSource from "../data-source";
import User from "../entity/User";

const saveOne = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  profileImage: string,
) => {
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

  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.save({
    email,
    password,
    firstName,
    lastName,
    profileImage,
    secret,
  });
  if (!user) throw new Error("Failed to save user to the db");

  return imageQr;
};

export default { saveOne };

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: boolean;

  @Column({ default: "" })
  profileImage!: string;

  @Column()
  secret!: string;
}

export default User;

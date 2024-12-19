import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import Role from "./Role";

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
  lastName!: string;

  @Column({ nullable: true })
  profileImage!: string;

  @Column({ nullable: true })
  secret!: string;

  @ManyToMany(() => Role, (role) => role.users, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinTable()
  roles!: Role[];
}

export default User;

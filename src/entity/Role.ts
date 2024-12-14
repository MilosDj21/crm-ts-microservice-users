import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import User from "./User";

@Entity()
class Role {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number;

  @Column({ unique: true })
  name!: string;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}

export default Role;

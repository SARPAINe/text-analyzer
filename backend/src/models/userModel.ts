import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../database";

// Define which attributes are required for creation
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

// Define the complete user attributes interface
interface UserAttributes {
  id: number;
  email: string;
  password?: string; // Nullable if Google user
  googleId?: string;
}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public password?: string;
  public googleId?: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure emails are unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
  }
);

export default User;

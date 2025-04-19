import sequelize from "../database";
import { Model, DataTypes, ForeignKey } from "sequelize";
import User from "./user.model";

interface TextAttributes {
  id?: number;
  content: string;
  creatorId: number; // Foreign key to User
  createdAt?: Date;
  updatedAt?: Date;
}

class Text extends Model<TextAttributes> {
  public id!: number;
  public content!: string;
  public creatorId!: number; // Foreign key to User
  public createdAt!: Date;
  public updatedAt!: Date;
}

Text.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // Reference the User model
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "texts",
    modelName: "Text",
    timestamps: true,
  }
);

export default Text;

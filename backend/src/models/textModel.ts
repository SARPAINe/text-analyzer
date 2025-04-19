import sequelize from "../database";
import { Model, DataTypes } from "sequelize";

interface TextAttributes {
  id?: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Text extends Model<TextAttributes> {
  public id!: number;
  public content!: string;
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
  },
  {
    sequelize,
    tableName: "texts",
    modelName: "Text",
    timestamps: true,
  }
);

export default Text;

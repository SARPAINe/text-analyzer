// filepath: /home/shaharin/Desktop/interview_task/text-analyzer/backend/src/models/associations.ts
import User from "./user.model";
import Text from "./text.model";

export const defineAssociations = () => {
  User.hasMany(Text, { foreignKey: "creatorId", as: "texts" });
  Text.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
};

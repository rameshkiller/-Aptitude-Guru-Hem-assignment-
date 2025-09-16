import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Question", {
    question: { type: DataTypes.STRING, allowNull: false },
    options: { type: DataTypes.TEXT, allowNull: false }, 
    answer: { type: DataTypes.STRING, allowNull: false },
  });
};

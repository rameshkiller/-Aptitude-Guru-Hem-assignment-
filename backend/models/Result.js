import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define("Result", {
    score: { type: DataTypes.INTEGER, allowNull: false },
    passed: { type: DataTypes.BOOLEAN, allowNull: false },
  });
};

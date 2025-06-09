import { DataType } from "sequelize-typescript";
import { Migration } from "../umzug";
import { AnimalTag, petStatusEnum } from "../types";

const TABLE_NAME = "pets";
const ANIMAL_TYPE_TABLE_NAME = "animal_types";

export const up: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();

  /* change animal_type_id to animal_tag (enum) */
  await queryInterface.removeColumn(TABLE_NAME, "animal_type_id");
  // delete taskType enum, otherwise causes issues with migrating up, down, then up
  await queryInterface.addColumn(TABLE_NAME, "animal_tag", {
    type: DataType.ENUM(...Object.values(AnimalTag)),
    allowNull: false,
    defaultValue: AnimalTag.DOG,
  });

  /* update pet status enum */
  await queryInterface.removeColumn(TABLE_NAME, "status");
  await sequelize
    .getQueryInterface()
    .sequelize.query('DROP TYPE IF EXISTS "enum_pets_status";');
  await queryInterface.addColumn(TABLE_NAME, "status", {
    type: DataType.ENUM(...petStatusEnum),
    allowNull: false,
    defaultValue: "Needs Care",
  });

  /* turn columns optional */
  await queryInterface.changeColumn(TABLE_NAME, "photo", {
    type: DataType.STRING,
    allowNull: true,
  });
  await queryInterface.changeColumn(TABLE_NAME, "breed", {
    type: DataType.STRING,
    allowNull: true,
  });
  // manual bc sequelize will try to create a duplicate sex enum
  await queryInterface.sequelize.query(
    `ALTER TABLE ${TABLE_NAME} ALTER COLUMN sex SET NOT NULL;`,
  );
  await queryInterface.changeColumn(TABLE_NAME, "neutered", {
    type: DataType.BOOLEAN,
    allowNull: true,
  });
  await queryInterface.changeColumn(TABLE_NAME, "weight", {
    type: DataType.FLOAT, // im assuming no animal is gonna be over 10000kg
    allowNull: true,
  });

  /* delete age, add birthday */
  await queryInterface.removeColumn(TABLE_NAME, "age");
  await queryInterface.addColumn(TABLE_NAME, "birthday", {
    type: DataType.DATEONLY,
    allowNull: true,
  });

  /* remove adoption_status */
  await queryInterface.removeColumn(TABLE_NAME, "adoption_status");
};

export const down: Migration = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  /* change animal_tag back to animal_type_id */
  // insert a row in animal_types with id 1 if it doesnt exist so that adding back animal_type_id doesn't have issues
  await queryInterface.sequelize.query(`
    INSERT INTO "animal_types" ("id", "animal_type_name")
    VALUES (1, 'Dog')
    ON CONFLICT ("id") DO NOTHING;
  `);
  await sequelize.getQueryInterface().addColumn(TABLE_NAME, "animal_type_id", {
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: ANIMAL_TYPE_TABLE_NAME,
      key: "id",
    },
  });
  await queryInterface.removeColumn(TABLE_NAME, "animal_tag");
  // delete enum, otherwise causes issues with migrating up, down, then up
  await sequelize
    .getQueryInterface()
    .sequelize.query('DROP TYPE IF EXISTS "enum_pets_animal_tag";');

  /* update pet status enum */
  await queryInterface.removeColumn(TABLE_NAME, "status");
  // delete taskType enum, otherwise causes issues with migrating up, down, then up
  await sequelize
    .getQueryInterface()
    .sequelize.query('DROP TYPE IF EXISTS "enum_pets_status";');
  await queryInterface.addColumn(TABLE_NAME, "status", {
    type: DataType.ENUM(
      "Active",
      "Assigned",
      "Needs Care",
      "Does Not Need Care",
    ),
    allowNull: false,
    defaultValue: "Needs Care",
  });

  /* turn columns mandatory */
  // have to fill null values first bc defaultValue only applies after :(
  // default pet photo is humane society logo (??)
  await queryInterface.sequelize.query(`
    UPDATE "pets" SET "photo" = 'https://postimg.cc/8fjrfbxK' WHERE "photo" IS NULL;
  `);
  await queryInterface.changeColumn(TABLE_NAME, "photo", {
    type: DataType.STRING,
    defaultValue: "https://postimg.cc/8fjrfbxK",
    allowNull: false,
  });
  await queryInterface.sequelize.query(`
    UPDATE "pets" SET "breed" = 'Unknown Breed' WHERE "breed" IS NULL;
  `);
  await queryInterface.changeColumn(TABLE_NAME, "breed", {
    type: DataType.STRING,
    defaultValue: "Unknown Breed",
    allowNull: false,
  });
  // manual bc sequelize will try to create a duplicate sex enum
  await queryInterface.sequelize.query(
    `ALTER TABLE ${TABLE_NAME} 
      ALTER COLUMN sex SET DEFAULT 'F',
      ALTER COLUMN sex DROP NOT NULL;`,
  );
  // have to fill null values first bc defaultValue only applies after :(
  await queryInterface.sequelize.query(`
    UPDATE "pets" SET "neutered" = false WHERE "neutered" IS NULL;
  `);
  await queryInterface.changeColumn(TABLE_NAME, "neutered", {
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  });
  await queryInterface.sequelize.query(`
    UPDATE "pets" SET "weight" = 0 WHERE "weight" IS NULL;
  `);
  await queryInterface.changeColumn(TABLE_NAME, "weight", {
    type: DataType.FLOAT,
    defaultValue: 0,
    allowNull: false,
  });

  /* delete birthday, add age */
  await queryInterface.addColumn(TABLE_NAME, "age", {
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });
  await queryInterface.removeColumn(TABLE_NAME, "birthday");

  /* add back adoption_status */
  await queryInterface.addColumn(TABLE_NAME, "adoption_status", {
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  });
};

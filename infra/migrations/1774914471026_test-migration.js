/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: "id",
    name: { type: "varchar(100)", notNull: true },
    created_at: {
      type: "timestamp",
      default: pgm.func("now()"),
    },
  });
};

exports.down = (pgm) => {};

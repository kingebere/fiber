import { Knex } from "knex"

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export const up = async (knex: Knex): Promise<void> => {
  return knex.schema.createTable("organizations", function (table) {
    //Why ask to use id when there is Index
    table.increments("id").primary()
    table.integer("Index", 15).notNullable()
    table.string("Organization Id", 15).notNullable()
    table.string("Name").notNullable()
    table.string("Website").notNullable()
    table.string("Country").notNullable()
    table.string("Description").notNullable()
    table.integer("Founded").notNullable()
    table.string("Industry").notNullable()
    table.integer("Number of employees").notNullable()
    //added time timestamp, although there is a updated_at there already
    table.timestamps(true, true)
  })
}

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable("customers")
}

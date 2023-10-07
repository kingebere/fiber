import { Knex } from 'knex';

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export const up = async (knex: Knex): Promise<void> => {
 
  return knex.schema.createTable('customers', function (table) {
    table.increments('id').primary(); 
    table.integer('Index',15).notNullable();
    table.string('Customer Id',15).notNullable();
    table.string('First Name').notNullable();
    table.string('Last Name').notNullable();
    table.string('Company').notNullable();
    table.string('City').notNullable();
    table.string('Country').notNullable();
    table.string('Phone 1', 20).notNullable();
    table.string('Phone 2', 20).notNullable();
    table.string('Email', 255).notNullable();
    table.datetime('Subscription Date').notNullable();
    table.string('Website').notNullable();
     table.timestamps(true,true);
  })
};

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
export const down = async (knex: Knex): Promise<void> => {
  return knex.schema.dropTable('customers');
};
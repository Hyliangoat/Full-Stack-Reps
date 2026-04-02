/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('favorites').del()
  await knex('favorites').insert([
    {id: 1, movie: 'Sherlock Holmes', synopsis: 'Cool detective tracks down bad guys with really sick fights and irish songs'},
    {id: 2, movie: 'Sherlock Holmes 2', synopsis: 'Cool detective tracks down one really bad guy with cool fights and Roma songs'},
    {id: 3, movie: 'Skinamarink', synopsis: 'One of the eeriest movies I have ever seen. Otherworldly entity traps children in another dimension'}
  ]);
};
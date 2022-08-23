// Dependencies
const fs = require('fs/promises');
const inquirer = require('inquirer');
const mysql2 = require('mysql2');
const cTable = require('console.table');

// MYSQL2: Create a connection to the database
const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HullGull983!$*',
    database: 'company_db'
  });

// Add Department, Add a Role, Add an Employee function
function addToDatabase(category, data){
    switch(category){
        case 'department':
            connection.query(`INSERT INTO departments (department_name) VALUES (${data})`);
            console.log(`Added ${data} to Departments Database`)
            break;
        
        case 'role':
            break;

        case 'employee':
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// Handle Main options
function handleMainOptions(choice) {
    switch (choice.selection) {
        case 'View All Departments':
            //do stuff
            connection.query(
                'SELECT id AS "ID", department_name AS "Department Name" FROM departments ORDER BY id;',
                function(results,fields) {
                    console.log('\n');
                    console.table(fields);
                    presentOptions();
                });
            break;
        case 'View All Roles':
            //do stuff
            connection.query(
                'SELECT roles.id AS "ID", title AS "Title", salary AS "Salary", department_name AS "Department Name" FROM roles INNER JOIN departments ON roles.department_id=departments.id ORDER BY roles.id;',
                function(results,fields) {
                    console.log('\n');
                    console.table(fields);
                    presentOptions();
                });
            break;
        case 'View All Employees':
            //do stuff
            connection.query(
                'SELECT worker.id AS "ID", worker.first_name AS "First Name", worker.last_name AS "Last Name", roles.title AS "Title", department_name AS "Department", roles.salary AS "Salary", CONCAT(mgr.first_name," ",mgr.last_name) AS Manager FROM employees worker LEFT JOIN employees mgr ON worker.manager_id=mgr.id INNER JOIN roles ON worker.role_id=roles.id INNER JOIN departments ON roles.department_id=departments.id ORDER BY worker.id;',
                function(results,fields) {
                    console.log('\n');
                    console.table(fields);
                    presentOptions();
                });
            break;
        case 'Add A Department':
            //do stuff
                addToDatabase("department", "test");
            break;
        case 'Add A Role':
            //do stuff
            break;
        case 'Add An Employee':
            //do stuff
            break;
        case 'Update An Employee Role':
            //do stuff
            break;
        default:
            console.log("There's been a grave mistake!");
    }
}

// INQUIRE: Present options
function presentOptions(){
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'selection',
                message: 'Please choose an option below',
                choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee Role']
            }
        ])
        .then((answer) => {
            handleMainOptions(answer);
        })
}

// INQUIRE: Starts initial display of options
function init() {
    presentOptions();
}

// Call init to show list of options
init();
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
function addToTable(category, data) {

    switch (category) {

        case 'department':
            connection.promise().execute(`INSERT INTO departments (department_name) VALUES ("${data}")`)
                .then(() => {
                    console.log("\n");
                    console.log(`Added ${data} to Departments Table in the Database`)
                    console.log("\n");
                    presentOptions();
                })
            break;

        case 'role':
            connection.promise().query('SELECT id FROM departments WHERE department_name = ' + "'" + data.department + "'" + ';')
                .then(([rows]) => {
                    connection.promise().execute('INSERT INTO roles (title, salary, department_id) VALUES (' + '"' + data.name + '"' + ',' + data.salary + ',' + rows[0].id + ');');
                    console.log("\n");
                    console.log(`Added ${data.name} with a salary of ${data.salary} to the Roles Table in the Database`);
                    console.log("\n");
                    presentOptions();
                });
            break;

        case 'employee':
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// Handle when Main options are selected
function handleMainOptions(choice) {
    switch (choice.selection) {

        case 'View All Departments':
            connection.promise().query('SELECT id AS "ID", department_name AS "Department Name" FROM departments ORDER BY id;')
                .then(([rows]) => {
                    console.log('\n');
                    console.table(rows);
                    presentOptions();
                });
            break;

        case 'View All Roles':
            connection.promise().query('SELECT roles.id AS "ID", title AS "Title", salary AS "Salary", department_name AS "Department Name" FROM roles INNER JOIN departments ON roles.department_id=departments.id ORDER BY roles.id;')
                .then(([rows]) => {
                    console.log('\n');
                    console.table(rows);
                    presentOptions();
                });
            break;

        case 'View All Employees':
            connection.promise().query('SELECT worker.id AS "ID", worker.first_name AS "First Name", worker.last_name AS "Last Name", roles.title AS "Title", department_name AS "Department", roles.salary AS "Salary", CONCAT(mgr.first_name," ",mgr.last_name) AS Manager FROM employees worker LEFT JOIN employees mgr ON worker.manager_id=mgr.id INNER JOIN roles ON worker.role_id=roles.id INNER JOIN departments ON roles.department_id=departments.id ORDER BY worker.id;')
                .then(([rows]) => {
                    console.log('\n');
                    console.table(rows);
                    presentOptions();
                });
            break;

        case 'Add A Department':
            addSomethingToTable('department');
            break;

        case 'Add A Role':
            addSomethingToTable('role');
            break;

        case 'Add An Employee':
            addSomethingToTable("employee");
            break;

        case 'Update An Employee Role':
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// INQUIRE: Add additional
function addSomethingToTable(category) {
    
    switch (category) {

        case 'department':
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'data',
                        message: 'What is the name of the department you would like to add?',
                    }
                ])
                .then((answer) => {
                    addToTable('department', answer.data);
                })
            break;

        case 'role':
            let currentDepartments = [];
            connection.promise().query('SELECT department_name FROM departments;')
            .then(([rows]) => {
                for (row of rows) {
                    currentDepartments.push(row.department_name);
                }
            
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'What is the name of the role you would like to add?',
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the Salary of that role?',
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the role belong to?',
                        choices: currentDepartments,
                    }

                ])
                .then((answer) => {
                    addToTable('role', answer);
                })
                });
            break;

            case 'employee':
                let currentRoles = [];
                connection.promise().query('SELECT title FROM roles;')
                .then(([rows]) => {
                    for (row of rows) {
                        currentRoles.push(row.title);
                    }
                })

                    let currentManagers = [];
                    connection.promise().query('SELECT CONCAT(first_name, " " , last_name) AS Managers FROM employees;')
                    .then(([rows]) => {
                        for (row of rows) {
                            currentManagers.push(row.Managers);
                            currentManagers.unshift('None');
                        }

                inquirer
                    .prompt([
                        {
                            type: 'input',
                            name: 'first_name',
                            message: "What is the employee's first name?",
                        },
                        {
                            type: 'input',
                            name: 'last_name',
                            message: "What is the employee's last name?",
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's role?",
                            choices: currentRoles,
                        },
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's Manager?",
                            choices: currentManagers,
                        },
    
                    ])
                    .then((answer) => {
                        addToTable('employee', answer);
                    })
                });
                break;

                default:
            console.log("There's been a grave mistake!");
    }
}

// INQUIRE: Present options
function presentOptions() {
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
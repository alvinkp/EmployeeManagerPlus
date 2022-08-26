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


// MYSQL2: Add Department, Add a Role, Add an Employee to Database
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
            let manager = data.manager.split(" ");
            let roleID;
            let managerID = 'NULL';
            connection.promise().query('SELECT id FROM roles WHERE title = ' + "'" + data.role + "'" + ';')
                .then(([rows]) => {
                    roleID = rows[0].id;

                    if (data.manager !== 'None') {
                        connection.promise().query('SELECT id FROM employees WHERE first_name =' + "'" + manager[0] + "'" + ' AND last_name =' + "'" + manager[1] + "'" + ';')
                            .then(([rows]) => {
                                managerID = rows[0].id;
                                connection.promise().execute('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (' + '"' + data.first_name + '"' + "," + '"' + data.last_name + '"' + ',' + roleID + ',' + managerID + ');')
                                console.log("\n");
                                console.log(`Added ${data.first_name + " " + data.last_name} with a role of ${data.role} and ${data.manager} as their Manager to the Employees Table in the Database`);
                                console.log("\n");
                                presentOptions();
                            });
                    }

                    else if (data.manager === 'None') {
                        connection.promise().execute('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (' + '"' + data.first_name + '"' + "," + '"' + data.last_name + '"' + ',' + roleID + ',' + managerID + ');')
                        console.log("\n");
                        console.log(`Added ${data.first_name + " " + data.last_name} with a role of ${data.role} to the Employees Table in the Database`);
                        console.log("\n");
                        presentOptions();
                    }
                });
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// MYSQL2: Modify existing entry in Database
function modifyDatabaseEntry(entry, data) {
    switch (entry) {
        case 'update role':
            connection.promise().execute('UPDATE employees SET role_id = ' + data[1] + ' WHERE id= ' + data[0] + ';')
            console.log("\n");
            console.log(`Updated Role Succesfully!`);
            console.log("\n");
            presentOptions();
            break;

        case 'update manager':
            connection.promise().execute('UPDATE employees SET manager_id = ' + data[1] + ' WHERE id= ' + data[0] + ';')
            console.log("\n");
            console.log(`Updated Manager Succesfully!`);
            console.log("\n");
            presentOptions();
            break;
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

        case "View All Employees by Manager":
            let currentEmployees = [];
            connection.promise().query('SELECT CONCAT(mgr.first_name," ",mgr.last_name) AS Manager FROM employees worker LEFT JOIN employees mgr ON worker.manager_id=mgr.id;')
                .then(([rows]) => {
                    for (let i = 0; i < rows.length; i++) {
                        if(rows[i].Manager !== null){
                            if (!currentEmployees.includes(rows[i].Manager)) {
                                currentEmployees.push(rows[i].Manager);
                            }
                        }
                    }

                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'manager',
                                message: 'Which Manager\'s employee\'s would you like to view?',
                                choices: currentEmployees
                            }
                        ])
                        .then((answer) => {
                            let selectedManager = answer.manager.split(" ");
                            
                            connection.promise().query('SELECT id FROM employees WHERE first_name = ' + "'" + selectedManager[0] + "' AND last_name =" + "'" + selectedManager[1] + "'")
                                .then(([rows]) => {
                                    let myMgrId = rows[0].id

                                    connection.promise().query('SELECT CONCAT(first_name, " ", last_name) AS "Direct Report(s)" FROM employees WHERE manager_id = ' + myMgrId + ';')
                                        .then(([rows]) => {
                                            console.log('\n');
                                            console.table(rows);
                                            presentOptions();
                                        });

                                })



                        })


                })
            break;

        case "View Employees By Department":
        let currentDepartments = [];
        connection.promise().query('SELECT department_name FROM departments ORDER BY id;')
            .then(([rows]) => {
                    for(row of rows){
                        currentDepartments.push(row.department_name);
                    }
            
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which Department\'s employee\'s would you like to view?',
                        choices: currentDepartments
                    }
                ])
                .then((answer) => {
                    connection.promise().query('SELECT CONCAT(first_name, " ",last_name) AS "Employee(s)" FROM employees JOIN roles ON role_id = roles.id JOIN departments ON roles.department_id = departments.id WHERE department_name = ' + "'" + answer.department + "';")
                        .then(([rows]) => {
                        console.log('\n');
                        console.table(rows);
                        presentOptions();
                    })
                })
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

        case 'Update An Employee\'s Role':
            addSomethingToTable("update role");
            break;

        case 'Update An Employee\'s Manager':
            addSomethingToTable("update manager");
            break;

        case 'Remove A Department':
            addSomethingToTable("delete department");
            break;

        case 'Remove A Role':
            addSomethingToTable("delete role");
            break;

        case 'Remove An Employee':
            addSomethingToTable("delete employee");
            break;

        case "View Total Utilized Budget By Department":
            addSomethingToTable("total budget");
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// INQUIRE: Add additional Department, Role or Employee to it's respective table, Modify an existing employee's role
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
            connection.promise().query('SELECT first_name, last_name FROM employees;')
                .then(([rows]) => {
                    for (row of rows) {
                        currentManagers.push(row.first_name + " " + row.last_name);
                    }
                    currentManagers.unshift('None');
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

        case 'update role':
            let currentEmployees = [];
            connection.promise().query('SELECT first_name, last_name FROM employees;')
                .then(([rows]) => {
                    for (row of rows) {
                        currentEmployees.push(row.first_name + " " + row.last_name);
                    }

                    let currentRoles = [];
                    connection.promise().query('SELECT title FROM roles;')
                        .then(([rows]) => {
                            for (row of rows) {
                                currentRoles.push(row.title);
                            }

                            inquirer
                                .prompt([
                                    {
                                        type: 'list',
                                        name: 'employees',
                                        message: 'Which employee do you want to update?',
                                        choices: currentEmployees,
                                    },
                                    {
                                        type: 'list',
                                        name: 'role',
                                        message: "What is the employee's new role?",
                                        choices: currentRoles,
                                    },
                                ])
                                .then((answer) => {
                                    let myAnswer = []
                                    let selectedEmployee = answer.employees.split(" ");
                                    connection.promise().query('SELECT id FROM employees WHERE first_name = ' + "'" + selectedEmployee[0] + "' AND last_name =" + "'" + selectedEmployee[1] + "'")
                                        .then(([rows]) => {
                                            let myEmpId = rows[0].id
                                            myAnswer.push(myEmpId)


                                            connection.promise().query('SELECT id FROM roles WHERE title = ' + "'" + answer.role + "';")
                                                .then(([rows]) => {
                                                    let myRoleID = rows[0].id
                                                    myAnswer.push(myRoleID)
                                                    modifyDatabaseEntry('update role', myAnswer);
                                                })
                                        })
                                })
                        })
                });
            break;

        case 'update manager':
            let currentEmp = [];
            let potentialManagers = [];
            connection.promise().query('SELECT first_name, last_name FROM employees;')
                .then(([rows]) => {
                    for (row of rows) {
                        currentEmp.push(row.first_name + " " + row.last_name);
                    }
                    connection.promise().query('SELECT first_name, last_name FROM employees;')
                        .then(([rows]) => {
                            for (row of rows) {
                                potentialManagers.push(row.first_name + " " + row.last_name);
                            }
                            potentialManagers.unshift('Remove Current Manager');

                            inquirer
                                .prompt([
                                    {
                                        type: 'list',
                                        name: 'employee',
                                        message: 'Which employee do you want to update?',
                                        choices: currentEmp,
                                    },
                                    {
                                        type: 'list',
                                        name: 'manager',
                                        message: "Who should be the employee's manager?",
                                        choices: potentialManagers,
                                    },
                                ])
                                .then((answer) => {
                                    let myAnswer = []
                                    let selectedEmployee = answer.employee.split(" ");

                                    connection.promise().query('SELECT id FROM employees WHERE first_name = ' + "'" + selectedEmployee[0] + "' AND last_name =" + "'" + selectedEmployee[1] + "'")
                                        .then(([rows]) => {
                                            let myEmpId = rows[0].id
                                            myAnswer.push(myEmpId)

                                            if (answer.manager !== "Remove Current Manager") {
                                                let selectedManager = answer.manager.split(" ");
                                                connection.promise().query('SELECT id FROM employees WHERE first_name = ' + "'" + selectedManager[0] + "' AND last_name =" + "'" + selectedManager[1] + "'")
                                                    .then(([rows]) => {
                                                        let myMgrId = rows[0].id
                                                        myAnswer.push(myMgrId)
                                                        modifyDatabaseEntry('update manager', myAnswer);
                                                        return;
                                                    })

                                            } else if (answer.manager === "Remove Current Manager") {
                                                let myMgrID = 'NULL';
                                                myAnswer.push(myMgrID);
                                                modifyDatabaseEntry('update manager', myAnswer);
                                                return;
                                            }

                                        })
                                })
                        })
                });
            break;

            case "delete department":
                let departments = [];
                    connection.promise().query('SELECT department_name FROM departments ORDER BY id;')
                    .then(([rows]) => {
                    for(row of rows){
                        departments.push(row.department_name);
                    }
            
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which Department would you like to remove?',
                        choices: departments
                    }
                ])
                .then((answer) => {
                    connection.promise().execute("DELETE FROM departments WHERE department_name = " + "'" + answer.department + "'" + ";")
                        .then(([rows]) => {
                            console.log("\n");
                            console.log(`Removed ${answer.department} Department Succesfully!`);
                            console.log("\n");
                            presentOptions();
                    })
                })
            });

            break;

            case "delete role":
                let roles = [];
                    connection.promise().query('SELECT title FROM roles ORDER BY id;')
                    .then(([rows]) => {
                    for(row of rows){
                        roles.push(row.title);
                    }
            
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Which Role would you like to remove?',
                        choices: roles
                    }
                ])
                .then((answer) => {
                    connection.promise().execute("DELETE FROM roles WHERE title = " + "'" + answer.role + "'" + ";")
                        .then(([rows]) => {
                            console.log("\n");
                            console.log(`Removed ${answer.role} Role Succesfully!`);
                            console.log("\n");
                            presentOptions();
                    })
                })
            });
            break;

            case "delete employee":
                let employees = [];
                    connection.promise().query('SELECT CONCAT(first_name, " ", last_name) AS "Name" FROM employees ORDER BY id;')
                    .then(([rows]) => {
                    for(row of rows){
                        employees.push(row.Name);
                    }
            
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: 'Which Employee would you like to remove?',
                        choices: employees
                    }
                ])
                .then((answer) => {
                    let employeeName = answer.employee.split(" ");
                    connection.promise().execute("DELETE FROM employees WHERE first_name = " + "'" + employeeName[0] + "'" + "AND last_name = " + "'" + employeeName[1] + "'" + ";")
                        .then(([rows]) => {
                            console.log("\n");
                            console.log(`Removed Employee ${answer.employee} Succesfully!`);
                            console.log("\n");
                            presentOptions();
                    })
                })
            });
            break;

            case "total budget":
                let depts = [];
                let total = 0;
                    connection.promise().query('SELECT department_name FROM departments ORDER BY id;')
                    .then(([rows]) => {
                    for(row of rows){
                        depts.push(row.department_name);
                    }
            
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'dept',
                        message: 'Which Department would you like to remove?',
                        choices: depts
                    }
                ])
                .then((answer) => {
                    connection.promise().query('SELECT salary FROM roles WHERE department_id =(SELECT id from departments WHERE department_name = ' + "'" + answer.dept + "'" + ') ;')
                    .then(([rows])=>{
                        for(row of rows){
                            console.log(row.salary)
                            total = total + parseInt(row.salary);
                        }
                        console.log("\n");
                        console.log(`The total budget for ${answer.dept} is ${total}.`);
                        console.log("\n");
                        presentOptions();
                    })
                })
            })
            break;

        default:
            console.log("There's been a grave mistake!");
    }
}

// INQUIRE: Present options for user to choose from
function presentOptions() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'selection',
                message: 'Please choose an option below',
                choices: ['View All Departments', 'View All Roles', 'View All Employees', "View All Employees by Manager", "View Employees By Department", 'Add A Department', 'Add A Role', 'Add An Employee', 'Update An Employee\'s Role', 'Update An Employee\'s Manager', 'Remove A Department', 'Remove A Role', 'Remove An Employee', "View Total Utilized Budget By Department"]
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
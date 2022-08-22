// Dependencies
const inquirer = require('inquirer');
const fs = require('fs/promises');

// Handle Main options
function handleMainOptions(selection) {
    switch (selection.selection) {
        case 'View All Departments':
            //do stuff
            break;
        case 'View All Roles':
            //do stuff
            break;
        case 'View All Employees':
            //do stuff
            break;
        case 'Add A Department':
            //do stuff
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

// Starts initial display of options
function init() {
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

// Call init to show list of options
init();
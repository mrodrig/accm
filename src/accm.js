let _ = require('underscore'),
    passwordHash = require('password-hash'),
    fs = require('fs');

// { nextId: autoincrement id value, users: {id: number, username: 'string', password: 'string', role: ['string']}}
let userDatabase = {nextId: 0, users: []};
let dbPath = '';

function writeDatabase() {
    fs.writeFileSync(dbPath, JSON.stringify(userDatabase,null, 4));
}

function indexOfUser(username) {
    return _.findIndex(userDatabase.users, function (user) { return user.username === username; });
}

function usernameExists(username) {
    return indexOfUser(username) >= 0;
}

let controller = {
    addUser : function (username, password, role, accountInfo) {
        if (!username || !password || !role) {
            throw new Error('A username, password, and role are required.');
        } else if (usernameExists(username)) {
            throw new Error('Username already exists');
        }
        userDatabase.users.push(_.extend({
            id: userDatabase.nextId++, 
            username: username, 
            password: passwordHash.generate(password),
            role: role
        }, accountInfo));
        writeDatabase();
        return true;
    },
    
    removeUser : function (username) {
        let index = indexOfUser(username);
        if (index < 0) { return null; }
        userDatabase.users.splice(indexOfUser(username), 1);
        writeDatabase();
        return true;
    },
    
    authenticate : function (username, password) {
        let index = indexOfUser(username);
        if (index < 0) { return null; }
        let userCopy = JSON.parse(JSON.stringify(userDatabase.users[index]));
        delete userCopy.password;
        return passwordHash.verify(password, userDatabase.users[index].password) && userCopy;
    },
    
    updateAccountField : function (username, key, value) {
        let index = indexOfUser(username);
        if (index < 0 || key === 'username') { return null; }
        userDatabase.users[index][key] = value;
        writeDatabase();
        return true;
    },
    
    updateRole : function (username, role) {
        return controller.updateAccountField(username, 'role', role);
    },
    
    updatePassword : function (username, newPassword) {
        if (!username || !newPassword) {
            throw new Error('A username and new password are required.');
        }
        return controller.updateAccountField(username, 'password', passwordHash.generate(newPassword));
    },
    
    checkAccess : function (username, allowedRoleOrRoles) {
        // Fetch user, if there is one.
        let index = indexOfUser(username);
        if (index < 0) { return null; } 
        let userRoleOrRoles = userDatabase.users[index].role;
        
        // Once the user has been found, use the appropriate approach to determine access.
        if (_.isString(allowedRoleOrRoles) && _.isString(userRoleOrRoles)) {
            return allowedRoleOrRoles === userRoleOrRoles;
        } else if (_.isString(allowedRoleOrRoles) && _.isArray(userRoleOrRoles)) {
            return _.contains(userRoleOrRoles, allowedRoleOrRoles);
        } else if (_.isArray(allowedRoleOrRoles) && _.isString(userRoleOrRoles)) {
            return _.contains(allowedRoleOrRoles,  userRoleOrRoles);
        } else {
            return _.reduce(userRoleOrRoles, function (acc, userRole) { return acc || _.contains(allowedRoleOrRoles, userRole); }, false);
        }
    },
    
    checkUsernameExists : function (username) {
        return usernameExists(username);
    },
    
    listUsers : function () {
        return _.map(JSON.parse(JSON.stringify(userDatabase.users)), function (user) {
            delete user.password;
            return user;
        });
    }
};

module.exports = function(pathToDb) {
    dbPath = pathToDb;
    // if the database does not currently exist (new configuration)
    if (!fs.existsSync(pathToDb)) {
        return controller;
    }
    userDatabase = JSON.parse(fs.readFileSync(pathToDb));
    return controller;
};
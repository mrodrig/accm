var _ = require('underscore'),
    passwordHash = require('password-hash'),
    fs = require('fs');

// { nextId: autoincrement id value, users: {id: number, username: 'string', password: 'string', role: ['string']}}
var userDatabase = {nextId: 0, users: []};
var dbPath = '';

var writeDatabase = function () {
    fs.writeFileSync(dbPath, JSON.stringify(userDatabase,null, 4));
};

var indexOfUser = function (username) {
    return _.findIndex(userDatabase.users, function (user) { return user.username === username; });
};

var usernameExists = function (username) {
    return indexOfUser(username) >= 0;
};

var interface = {
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
        var index = indexOfUser(username);
        if (index < 0) { return null; }
        userDatabase.users.splice(indexOfUser(username), 1);
        writeDatabase();
        return true;
    },
    
    authenticate : function (username, password) {
        var index = indexOfUser(username);
        if (index < 0) { return null; }
        return passwordHash.verify(password, userDatabase.users[index].password) && userDatabase.users[index];
    },
    
    updateAccountField : function (username, key, value) {
        var index = indexOfUser(username);
        if (index < 0 || key === 'username') { return null; }
        userDatabase.users[index][key] = value;
        writeDatabase();
        return true;
    },
    
    updateRole : function (username, role) {
        return interface.updateAccountField(username, 'role', role);
    },
    
    updatePassword : function (username, newPassword) {
        if (!username || !newPassword) {
            throw new Error('A username and new password are required.');
        }
        return interface.updateAccountField(username, 'password', passwordHash.generate(newPassword));
    },
    
    checkAccess : function (username, allowedRoles) {
        var index = indexOfUser(username);
        if (index < 0) { return null; }
        return _.contains(allowedRoles, userDatabase.users[index].role);
    },
    
    checkUsernameExists : function (username) {
        return usernameExists(username);
    },
    
    listUsers : function () {
        return _.map(userDatabase.users, function (user) {
            delete user.password;
            return user;
        });
    }
};

module.exports = function(pathToDb) {
    dbPath = pathToDb;
    // if the database does not currently exist (new configuration)
    if (!fs.existsSync(pathToDb)) {
        return interface;
    }
    userDatabase = JSON.parse(fs.readFileSync(pathToDb));
    return interface;
};
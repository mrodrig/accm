var _ = require('underscore'),
    passwordHash = require('password-hash'),
    fs = require('fs');

// { nextId: autoincrement id value, users: {id: number, username: 'string', password: 'string', branch: number, role: ['string']}}
var userDatabase = {nextId: 0, users: []};
var dbPath = '';

var writeDatabase = function () {
    fs.writeFileSync(dbPath, JSON.stringify(userDatabase,null, 4));
};

var indexOfUser = function (username) {
    var index = _.findIndex(userDatabase.users, function (user) { return user.username === username; });
    return index === -1 ? null : index;
};

var interface = {
    addUser : function (username, password, role) {
        userDatabase.users.push({id: userDatabase.nextId++, username: username, password: passwordHash.generate(password), role: role});
        writeDatabase();
    },
    
    removeUser : function (username) {
        var index = indexOfUser(username);
        if (_.isNull(index)) { return null; }
        userDatabase.users.splice(indexOfUser(username), 1);
        writeDatabase();
        return true;
    },
    
    authenticate : function (username, password) {
        var index = indexOfUser(username);
        return _.isNull(index) ? null : passwordHash.verify(password, userDatabase.users[index].password);
    },
    
    updateRole : function (username, role) {
        var index = indexOfUser(username);
        if (_.isNull(index)) { return null; }
        userDatabase.users[index].role = role;
        writeDatabase();
        return true;
    },
    
    updatePassword : function (username, newPassword) {
        var index = indexOfUser(username);
        if (_.isNull(index)) { return null; }
        userDatabase.users[index].password = passwordHash.generate(newPassword);
        writeDatabase();
        return true;
    },
    
    checkAccess : function (username, allowedRoles) {
        var index = indexOfUser(username);
        if (_.isNull(index)) { return null; }
        return _.contains(allowedRoles, userDatabase.users[index].role);
    }
};

module.exports = function(pathToDb) {
    dbPath = pathToDb;
    // if the database does not currently exist (new configuration)
    if (!fs.existsSync(pathToDb)) {
        return interface;
    }
    userDatabase = require(pathToDb);
    return interface;
};
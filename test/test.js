let should = require('should'),
    assert = require('assert'),
    fs = require('fs'),
    _ = require('underscore'),
    accm = require('../src/accm.js'),
    testDbPath = './test/users.json',
    userDb = accm(testDbPath);
    
let readDatabase = function () {
    return JSON.parse(fs.readFileSync(testDbPath));
};

let dbTests = function () {
    describe('accm Module', function () {
        describe('Verify Interface Functions', function () {
            it('should provide interface functions', function (done) {
                userDb.should.have.property('addUser');
                userDb.should.have.property('removeUser');
                userDb.should.have.property('authenticate');
                userDb.should.have.property('updateAccountField');
                userDb.should.have.property('updateRole');
                userDb.should.have.property('updatePassword');
                userDb.should.have.property('checkAccess');
                (typeof accm).should.equal('function');
                (typeof userDb).should.equal('object');
                (typeof userDb.addUser).should.equal('function');
                (typeof userDb.removeUser).should.equal('function');
                (typeof userDb.authenticate).should.equal('function');
                (typeof userDb.updateAccountField).should.equal('function');
                (typeof userDb.updateRole).should.equal('function');
                (typeof userDb.updatePassword).should.equal('function');
                (typeof userDb.checkAccess).should.equal('function');
                done();
            });
        });

        describe('Verify Interface Functionality', function () {
            beforeEach(function () {
                // remove the existing db
                if (fs.existsSync(testDbPath)) {
                    fs.unlinkSync(testDbPath);
                }
                // then create new one for each test
                userDb = accm(testDbPath);
            });

            describe('file creation', function () {
                beforeEach(function () {
                    _.each(userDb.listUsers(), function (user) {
                        userDb.removeUser(user.username);
                    });
                });
                
                it('should not write the database at creation because it is empty', function (done) {
                    let exists = fs.existsSync(testDbPath);
                    exists.should.equal(false);
                    done();
                });
                
                it('should not write the database if removeUser is called on empty db', function (done) {
                    let returnCode = userDb.removeUser('test');
                    let exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, null);
                    exists.should.equal(false);
                    done();
                });
                
                it('should write the database if addUser is called (empty)', function (done) {
                    let returnCode = userDb.addUser('test', 'test123', 'Tester', {branch:2});
                    let exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, true);
                    exists.should.equal(true);
                    let database = readDatabase();
                    database.users.length.should.equal(1);
                    database.users[0].branch.should.equal(2);
                    done();
                });
                
                it('should write the database if addUser is called (non-empty)', function (done) {
                    //test:
                    let returnCode = userDb.addUser('test', 'test123', 'Tester', {branch:2});
                    let exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, true);
                    exists.should.equal(true);
                    returnCode = userDb.addUser('test2', 'tester', 'Tester', {branch:3});
                    exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, true);
                    exists.should.equal(true);
                    done();
                });
                
                it('should write the database if removeUser is called (non-empty)', function (done) {
                    let returnCode = userDb.addUser('test', 'test123', 'Tester', {branch:2});
                    let exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, true);
                    exists.should.equal(true);
                    returnCode = userDb.removeUser('test');
                    exists = fs.existsSync(testDbPath);
                    assert.equal(returnCode, true);
                    exists.should.equal(true);
                    done();
                });
            });
            
            describe('account functionality', function () {
                it('should create an account', function (done) {
                    try {
                        userDb.addUser();
                    } catch (e) {
                        e.message.should.equal('A username, password, and role are required.');
                    }
                    userDb.addUser('rob', 'robby123', 'Admin', {branch: 2});
                    let database = readDatabase();
                    database.users[0].username.should.equal('rob');
                    database.users[0].password.should.not.equal('robby123');
                    database.users[0].role.should.equal('Admin');
                    database.users[0].branch.should.equal(2);
                    let length = database.users.length;
                    try {
                        userDb.addUser('rob', 'robby123', 'Admin', {branch: 2});
                    } catch (e) {
                        e.message.should.equal('Username already exists');
                    }
                    userDb.removeUser('rob');
                    database = readDatabase();
                    database.users.length.should.not.equal(length);
                    done();
                });
                
                it('should be able to authenticate a username/password', function(done) {
                    userDb.addUser('mike', 'accm_developer', 'Developer');
                    let returnCode = userDb.authenticate('mike', 'a_developer');
                    returnCode.should.equal(false);
                    returnCode = userDb.authenticate('mike', 'acm_developer');
                    returnCode.should.equal(false);
                    returnCode = userDb.authenticate('mike', 'accm_developer');
                    returnCode.should.not.equal(false);
                    (typeof returnCode).should.equal('object');
                    returnCode.username.should.equal('mike');
                    returnCode = userDb.authenticate('userdoesnotexist', 'asdasdasc');
                    assert.equal(returnCode, null);
                    done();
                });
                
                it('should be able to update user fields', function(done) {
                    userDb.addUser('mrodrig', 'accm_dev', 'Dev', {branch:5});
                    userDb.updateRole('mrodrig', 'Developer');
                    userDb.updateAccountField('mrodrig', 'branch', 1);
                    userDb.updatePassword('mrodrig', 'dev');
                    try {
                        userDb.updatePassword('userdoesnotexist');
                    } catch (e) {
                        e.message.should.equal('A username and new password are required.');
                    }
                    let user = userDb.authenticate('mrodrig', 'dev');
                    user.role.should.equal('Developer');
                    user.branch.should.equal(1);
                    let returnCode = userDb.updateRole('userdoesnotexist', 'Admin');
                    assert.equal(returnCode, null);
                    done();
                });
                
                it('should be able to check if a user has access', function(done) {
                    userDb.addUser('testing2', 'accm_dev', 'Dev', {branch:5});
                    userDb.addUser('testing3', 'accm_dev', ['Dev', 'Admin2'], {branch:5});
                    let returnCode = userDb.checkAccess('mrodrig', []);
                    returnCode.should.equal(false);
                    returnCode = userDb.checkAccess('testing2', ['Admin']);
                    returnCode.should.equal(false);
                    returnCode = userDb.checkAccess('testing2', 'Admin');
                    returnCode.should.equal(false);
                    returnCode = userDb.checkAccess('testing2', ['Admin', 'Dev', 'Administrator']);
                    returnCode.should.equal(true);
                    returnCode = userDb.checkAccess('testing3', ['Admin', 'Dev', 'Administrator']);
                    returnCode.should.equal(true);
                    returnCode = userDb.checkAccess('testing3', ['Admin1', 'Dev', 'Administrator']);
                    returnCode.should.equal(true);
                    returnCode = userDb.checkAccess('testing3', ['Administrator']);
                    returnCode.should.equal(false);
                    returnCode = userDb.checkAccess('testing3', 'Administrator');
                    returnCode.should.equal(false);
                    returnCode = userDb.checkAccess('testing3', ['Administrator', 'Admin2', 'Dev']);
                    returnCode.should.equal(true);
                    returnCode = userDb.checkAccess('userdoesnotexist', ['Administrator', 'Admin2', 'Dev']);
                    assert.equal(returnCode, null);
                    done();
                });
                
                it('should be able to check if a user exists', function(done) {
                    let returnCode = userDb.checkUsernameExists('rob');
                    returnCode.should.equal(false);
                    returnCode = userDb.checkUsernameExists('mike');
                    returnCode.should.equal(true);
                    done();
                });
            });
            
            describe('remove test file', function () {
                it('empty test block to clear out the users.json file', function (done) {
                    done();
                });
            });
        });
    });
    
    describe('Reusability Persistence Test', function () {
        beforeEach(function () {
            // remove the existing db
            if (fs.existsSync(testDbPath)) {
                fs.unlinkSync(testDbPath);
            }
            // then create new one for each test
            userDb = accm(testDbPath);
        });
        
        it('should be able to open an existing database', function (done) {
            // create db
            let db = accm(testDbPath);
            
            db.addUser('r1', 'pass123', 'Admin');
            db.addUser('r2', 'pass123', 'Admin');
            
            db = accm(testDbPath);
            done();
        });
        
        it('empty test block to clear out the users.json file', function (done) {
            done();
        });
    });
};

dbTests();
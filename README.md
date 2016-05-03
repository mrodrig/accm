# Basic JSON Account Management System for NodeJS

[![Build Status](https://travis-ci.org/mrodrig/accm.svg?branch=master)](https://travis-ci.org/mrodrig/accm)
[![bitHound Dependencies](https://www.bithound.io/github/mrodrig/accm/badges/dependencies.svg)](https://www.bithound.io/github/mrodrig/accm/master/dependencies/npm)
[![Downloads](http://img.shields.io/npm/dm/accm.svg)](https://www.npmjs.org/package/accm)
[![NPM version](https://img.shields.io/npm/v/accm.svg)](https://www.npmjs.org/package/accm)
[![bitHound Score](https://www.bithound.io/github/mrodrig/accm/badges/score.svg)](https://www.bithound.io/github/mrodrig/accm)

## Installation

```bash
$ npm install accm
```

## Usage

```javascript
var accm = require('accm'),
    userDb = accm('./path/to/user/database.json');
```

### API

#### addUser(username, password, role, accountInfo)

* `username` - `String` The username for the account to be created.
* `password` - `String` The user's password. Clear-text unless opts.passwordHashed is `true`.
  * Note: The transmission of clear text passwords is unsafe.  Passwords should be encrypted or hashed for transmission.
* `role` - `String | Array[String]` Either a String or an array of Strings indicating the user's role(s).
* `accountInfo` - `Object` Additional fields to be copied over to the user object.

#### removeUser(username)
* `username` - `String` The username for the account to be deleted.

#### authenticate(username, password)
* `username` - `String` The username for the account that is being logged into.
* `password` - `String` The user's password. Clear-text unless opts.passwordHashed is `true`.
  * Note: The transmission of clear text passwords is unsafe.  Passwords should be encrypted or hashed for transmission.

#### updateAccountField(username, key, value)
* `username` - `String` The username for the account being updated.
* `key` - `String` The key to be updated (ie. `role`)
* `value` - `Any` The value to be stored (ie. `Administrator`).

#### updateRole(username, role)
* `username` - `String` The username for the account being updated.
* `role` - `String | Array[String]` Either a String or an array of Strings indicating the user's role(s).

#### updatePassword(username, newPassword)
* `username` - `String` The username for the account being updated.
* `newPassword` - `String` The new password.

* Note: It is recommended to require users to authenticate prior to allowing password changes.

#### checkAccess(username, allowedRoleOrRoles)
* `username` - `String` The username for the account that is being checked.
* `allowedRoleOrRoles` - `String | Array[String]` Either a String or an array of Strings of the allowed roles.

#### checkUsernameExists(username)
* `username` - `String` The username being checked.

#### listUsers()
* Note:
  * This lists all users without passwords.
  * All fields, including the additional customized fields, will be returned in the user object
  * This is ideal for an Administration view listing users for management purposes.

## Tests

```bash
$ npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

Current Coverage is:
```
Statements   : 85.48% ( 53/62 )
Branches     : 74.36% ( 29/39 )
Functions    : 93.75% ( 15/16 )
Lines        : 89.29% ( 50/56 )
```

## Features
* Customizable workflow
* Easily modified
* Hashed passwords using `password-hash` module.
* JSON database storage by default (more options coming soon)
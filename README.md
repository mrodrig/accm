# Basic JSON Account Management System for NodeJS

[![Dependencies](https://img.shields.io/david/mrodrig/accm.svg?style=flat-square)](https://www.npmjs.org/package/accm)
[![Build Status](https://travis-ci.org/mrodrig/accm.svg?branch=master)](https://travis-ci.org/mrodrig/accm)
[![Downloads](http://img.shields.io/npm/dm/accm.svg)](https://www.npmjs.org/package/accm)
[![NPM version](https://img.shields.io/npm/v/accm.svg)](https://www.npmjs.org/package/accm)
[![Maintainability](https://api.codeclimate.com/v1/badges/1765da9b942286c0bb13/maintainability)](https://codeclimate.com/github/mrodrig/accm/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/npm/accm/badge.svg)](https://snyk.io/test/npm/accm)

## Installation

```bash
$ npm install accm
```

## Usage

```javascript
let accm = require('accm'),
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
Statements   : 100% ( 62/62 )
Branches     : 100% ( 39/39 )
Functions    : 100% ( 16/16 )
Lines        : 100% ( 56/56 )
```

## Features
* Customizable workflow
* Easily modified
* Hashed passwords using `password-hash` module.
* JSON database storage by default (more options coming soon)
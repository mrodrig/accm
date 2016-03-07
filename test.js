var accm = require('./accm.js');

var db = accm('./users.json');
//db.addUser('mrodrig', 'test', 'Administrator');
console.log(db.removeUser('mrodrig'));
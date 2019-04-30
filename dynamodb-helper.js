/* dynamodb-helper.js
 *
 * How to use:
 *
 *     var DynamoDbHelper = require('./dynamodb-helper');
 *     var db = new DynamoDbHelper('someTableName');
 *
 *     let someUserId = 'someAlexaUsersId';
 *
 *     db.readUserData(someUserId, (userData) => {
 *        // do something with the result...
 *        console.log('data: ', userData.data);  // userData: a row from the table; data: target column's name
 *     });
 */
'use strict';

var userDataTableName = 'userDataTable';
var userDataTableKey = 'userId';

// AWS automatically sets the environment variables on remote,
// so keep this as is and no need to configure anything
var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

var dynasty = require('dynasty')(credentials);

function DynamoDbHelper(tableName, tableKey) {
    userDataTableName = tableName;
    userDataTableKey = tableKey;
}

var getTable = function (tableName) {
    return dynasty.table(tableName);
};

DynamoDbHelper.prototype.createTable = function (tableName, keyColumnName) {
    return dynasty
        .create(tableName, {
            key_schema: {
                hash: [keyColumnName, 'string']
            }
        })
        .then(function (resp) {
            dynasty.describe(tableName)
                .catch(function (error) {
                    console.log('There was an error describing the table: \n', error);
                });
        })
        .catch((err) => {
            console.log("There was an error creating the table: \n", err.stack);
        });
};

DynamoDbHelper.prototype.storeUserData = function (userId, data) {
    return getTable(userDataTableName).insert({
        [userDataTableKey]: userId,
        data: data
    }).catch(function (error) {
        console.log('There was an error storing user data: \n', error);
    });
};

DynamoDbHelper.prototype.readUserData = function (userId, callback) {
    return getTable(userDataTableName).find(userId)
        .then(function (result) {
            callback(result);
            return result;
        })
        .catch(function (error) {
            console.log('There was an error reading user data: \n', error);
        });
};

module.exports = DynamoDbHelper;

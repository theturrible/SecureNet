var async = require('async'); // for clean demonstration

var kloudless = require('kloudless')('cmNybKpjmBMtKR34MvJ_g5UZJ_vYEJTdhqJQLW7_LfQGkPCB');

var accountId;

async.series([
function(cb) {

    // to get the base account data
    kloudless.accounts.base({}, // needs no data passed in
        function(err,res){
            if(err) { console.log("Error getting the account data: "+err); }
            else {
                // assuming you authorized at least one service (Dropbox, Google Drive, etc.)
                console.log("We got the account data!");
                accountId = res["objects"][0]["id"];
                cb();
            }
        }
    );

},
function(cb) {

    // to upload a file to the account we just got data for
    kloudless.files.upload(
        {"name": "test.txt",
        "account_id": accountId,
        "parent_id": "root",
        // assuming "test.txt" is in the same directory as this script file
        "file_path": "test.txt"},
        function(err,res) {
            if(err) { console.log("Error uploading file: "+err); }
            else {
                console.log("We uploaded the file!");
            }
        }
    );

}
]);
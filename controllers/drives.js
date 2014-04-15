/**
 * GET /MyDrives
 * List all books.
 */

var request = require('request');
exports.getDrives = function(req, res) {
	
	//svar = request.post('http://service.com/upload', {form:{key:'value'}})
	var options = {
	    url: 'https://api.kloudless.com/v0/accounts?active=True',
	    headers: {
	        'Authorization': 'ApiKey cmNybKpjmBMtKR34MvJ_g5UZJ_vYEJTdhqJQLW7_LfQGkPCB',
	        
        }
	};

    function callback(error, response, body) {
    	if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            console.log(info);
            console.log("this nigguh is ", info.objects[0].account);
        	//console.log( "console.log from callback : ", info);
        	//console.log(info.id);
        	res.render("testing", {
    			fullResponse: JSON.stringify(info, null, 2),
   			});	
    	}
    }    	
    request(options, callback);
};


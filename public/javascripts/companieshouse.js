var companiesHouse = require('companies-house')('dhokmSz0Kxz0LOMVRmhAo4x1Fxlcdh0oAGBxnUSd')

companiesHouse.search('certsimple', function(err, res){
	console.log(err, res)
})

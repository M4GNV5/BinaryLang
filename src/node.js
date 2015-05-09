var fs = require('fs');
var BinaryLang = require('./binaryLang.js');
var args = process.argv.slice(2);

BinaryLang.input = function()
{
	process.stdout.write("Script requires input: ");

	var isWin = process.platform == 'win32';
	var buffer = new Buffer(256);
	var fd = isWin ? process.stdin.fd : fs.openSync('/dev/stdin', 'rs');

	var bytes = fs.readSync(fd, buffer, 0, buffer.length);
	if (isWin)
		fs.closeSync(fd);

	return buffer.toString(null, 0, bytes);
}
BinaryLang.output = function(text)
{
	process.stdout.write(text.toString());
}
BinaryLang.error = function(text)
{
	throw error;
}

fs.exists(args[0], function(exists)
{
	if(!exists)
		throw 'requires the first argument to be a file with the BinaryLang code inside';

	fs.readFile(args[0], function(err, data)
	{
		if(err)
			throw err;

		BinaryLang.execute(data.toString());
	});
});

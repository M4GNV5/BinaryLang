var BinaryLang = new function()
{
	//user defined
	this.fields = [];
	this.functions = [];

	//api
	this.commands = [];
	this.argumentsCount = [];
	this.commandSize = 4;
	this.argumentSize = 8;

	this.error = function(message)
	{
		throw message;
	}
	this.output = function(value)
	{
		console.log(value);
	}

	this.reset = function()
	{
		this.fields = [];
		this.functions = [];

		this.commandSize = 4;
		this.argumentSize = 8;
	}

	var pos = 0;
	var currentFunction = -1;
	this.execute = function(source, reset)
	{
		pos = 0;

		if(reset !== false)
			this.reset();

		source = source.replace(/[^01]/g, "");
		while(pos < source.length)
		{
			var cmd = source.substr(pos, this.commandSize);
			var decimalCmd = parseInt(cmd, 2);

			if(isNaN(decimalCmd))
				this.error("invalid command " + cmd + " at " + pos);
			if(typeof this.commands[decimalCmd] != 'function' || typeof this.argumentsCount[decimalCmd] != 'number')
				this.error("unknown command " + cmd + " at " + pos);

			pos += this.commandSize;

			var args = [];
			while (args.length < this.argumentsCount[decimalCmd])
			{
				var arg = source.substr(pos, this.argumentSize);
				var decimalArg = parseInt(arg, 2);
				if(isNaN(decimalArg))
					this.error("invalid argument " + cmd + " at " + pos);
				args.push(decimalArg);
				pos += this.argumentSize;
			}
			
			if(currentFunction > 0)
			{
				this.functions[currentFunction].push({cmd: decimalCmd, args: args});
			}
			else
			{
				this.commands[decimalCmd].apply(this, args);
			}
		}
	}



	this.argumentsCount[0] = 2;
	this.commands[0] = function(adress, value) //set adress value
	{
		this.fields[adress] = value;
	}

	this.argumentsCount[1] = 2;
	this.commands[1] = function(source, destination) //copy source destination
	{
		this.fields[destination] = this.fields[source];
	}

	this.argumentsCount[2] = 1;
	this.commands[2] = function(adress) //out adress
	{
		this.output(String.fromCharCode(this.fields[adress]));
	}

	this.argumentsCount[3] = 2;
	this.commands[3] = function(adress, other) //adress += other
	{
		this.fields[adress] += this.fields[other];
	}

	this.argumentsCount[4] = 2;
	this.commands[4] = function(adress, other) //adress -= other
	{
		this.fields[adress] -= this.fields[other];
	}

	this.argumentsCount[5] = 2;
	this.commands[5] = function(adress, other) //adress *= other
	{
		this.fields[adress] *= this.fields[other];
	}

	this.argumentsCount[6] = 2;
	this.commands[6] = function(adress, other) //adress /= other
	{
		this.fields[adress] /= this.fields[other];
	}

	this.argumentsCount[7] = 2;
	this.commands[7] = function(adress, other) //adress %= other
	{
		this.fields[adress] %= this.fields[other];
	}


	this.argumentsCount[8] = 1;
	this.commands[8] = function(adress) //start function
	{
		this.functions[adress] = [];
		currentFunction = adress;
	}

	this.argumentsCount[9] = 0;
	this.commands[9] = function() //end function
	{
		if(currentFunction < 0)
			this.error("invalid end function");
		currentFunction = -1;
	}


	function callFunc(id)
	{
		var func = this.functions[id];

		for(var i = 0; i < func.length; i++)
		{
			this.command[func[i].cmd].apply(this, func[i].args)
		}
	}

	this.argumentsCount[10] = 3;
	this.commands[10] = function(adress, other, func) //if adress == other jump to func
	{
		if(this.fields[adress] == this.fields[other])
			callFunc(func);
	}

	this.argumentsCount[11] = 3;
	this.commands[11] = function(adress, other, func) //if adress != other jump to func
	{
		if(this.fields[adress] != this.fields[other])
			callFunc(func);
	}

	this.argumentsCount[12] = 3;
	this.commands[12] = function(adress, other, func) //if adress < other jump to func
	{
		if(this.fields[adress] < this.fields[other])
			callFunc(func);
	}

	this.argumentsCount[13] = 3;
	this.commands[13] = function(adress, other, func) //if adress > other jump to func
	{
		if(this.fields[adress] > this.fields[other])
			callFunc(func);
	}

	this.argumentsCount[14] = 1;
	this.commands[14] = function(func) //jump to func
	{
		callFunc(func);
	}

	this.argumentsCount[15] = 1;
	this.commands[15] = function(newSize) //set argument size
	{
		this.argumentSize = newSize;
	}
};
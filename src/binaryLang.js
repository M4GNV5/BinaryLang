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
	this.input = function()
	{
		throw "read not implemented";
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
			
			if(currentFunction > -1 && decimalCmd != 9) //if decimalCmd is end function actually call it
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
	this.commands[0] = function(address, value) //set address value
	{
		this.fields[address] = value;
	}

	this.argumentsCount[1] = 2;
	this.commands[1] = function(source, destination) //copy source destination
	{
		this.fields[destination] = this.fields[source];
	}

	this.argumentsCount[2] = 1;
	this.commands[2] = function(address) //out address
	{
		this.output(String.fromCharCode(this.fields[address]));
	}

	this.argumentsCount[3] = 2;
	this.commands[3] = function(address, length) //read to address with length
	{
		var input = this.input();
		for(var i = 0; i < length; i++)
		{
			if(i < input.length)
				this.fields[address + i] = input.charCodeAt(i);
			else
				this.fields[address + i] = 0;
		}
	}

	this.argumentsCount[4] = 2;
	this.commands[4] = function(address, other) //address += other
	{
		this.fields[address] += this.fields[other];
	}

	this.argumentsCount[5] = 2;
	this.commands[5] = function(address, other) //address -= other
	{
		this.fields[address] -= this.fields[other];
	}

	this.argumentsCount[6] = 2;
	this.commands[6] = function(address, other) //address *= other
	{
		this.fields[address] *= this.fields[other];
	}

	this.argumentsCount[7] = 2;
	this.commands[7] = function(address, other) //address /= other
	{
		this.fields[address] /= this.fields[other];
	}


	this.argumentsCount[8] = 1;
	this.commands[8] = function(address) //start function
	{
		this.functions[address] = [];
		currentFunction = address;
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
			this.commands[func[i].cmd].apply(this, func[i].args);
		}
	}

	this.argumentsCount[10] = 3;
	this.commands[10] = function(address, other, func) //if address == other jump to func
	{
		if(this.fields[address] == this.fields[other])
			callFunc.call(this, func);
	}

	this.argumentsCount[11] = 3;
	this.commands[11] = function(address, other, func) //if address != other jump to func
	{
		if(this.fields[address] != this.fields[other])
			callFunc.call(this, func);
	}

	this.argumentsCount[12] = 3;
	this.commands[12] = function(address, other, func) //if address < other jump to func
	{
		if(this.fields[address] < this.fields[other])
			callFunc.call(this, func);
	}

	this.argumentsCount[13] = 3;
	this.commands[13] = function(address, other, func) //if address > other jump to func
	{
		if(this.fields[address] > this.fields[other])
			callFunc.call(this, func);
	}

	this.argumentsCount[14] = 1;
	this.commands[14] = function(func) //jump to func
	{
		callFunc.call(this, func);
	}

	this.argumentsCount[15] = 3;
	this.commands[15] = function(fn, arg0, arg1) //ext2
	{
		switch(fn)
		{
		case 0: // set bit depth to arg0
			this.argumentSize = arg0;
			break;
		case 1: // copy pointer
			this.fields[arg0] = this.fields[this.fields[arg1]];
			break;
		case 2: // modulo
			this.fields[arg0] %= this.fields[arg1];
			break;
		case 3: // bitshift left
			this.fields[arg0] <<= this.fields[arg1];
			break;
		case 4: // bitshift right
			this.fields[arg0] >>= this.fields[arg1];
			break;
		default:
			throw "Extension not implemented: " + fn;
		}
	}
};

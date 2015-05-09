var BinaryLang = new function()
{
	//user defined
	this.fields = [];
	this.functions = [];

	//api
	this.commands = [];
	this.extensionCommands = [];
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

		if(length == 0)
			length = input.length;

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
		this.fields[address] = Math.floor(this.fields[address] / this.fields[other]);
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
	this.commands[15] = function(id, arg0, arg1) //extension functions
	{
		if(typeof this.extensionCommands[id] == 'undefined')
			this.error('Unknown extension ' + id);

		this.extensionCommands[id].call(this, arg0, arg1);
	}
	this.addExtension = function(id, func)
	{
		this.extensionCommands[id] = func;
	}

	this.extensionCommands[0] = function(adress, value) // set value at adress
	{
		this.fields[this.fields[address]] = value;
	}

	this.extensionCommands[1] = function(address, other) // copy pointer
	{
		this.fields[address] = this.fields[this.fields[other]];
	}

	this.extensionCommands[2] = function(address) //out integer
	{
		this.output(this.fields[address]);
	}

	this.extensionCommands[3] = function(adress) //read integer
	{
		this.fields[adress] = parseInt(this.input());
	}



	this.extensionCommands[4] = function(address, other) //modulo
	{
		this.fields[address] %= this.fields[other];
	}

	this.extensionCommands[5] = function(address, other) // bitshift left
	{
		this.fields[address] <<= this.fields[other];
	}

	this.extensionCommands[6] = function(address, other) // bitshift right
	{
		this.fields[address] >>= this.fields[other];
	}

	this.extensionCommands[7] = function(address) // address *= -1
	{
		this.fields[address] *= -1;
	}

	this.extensionCommands[8] = function(address) // adress = |adress|
	{
		this.fields[address] = Math.abs(this.fields[adress]);
	}

	this.extensionCommands[9] = function(adress, max) // adress = random between 0 and max
	{
		this.fields[address] = Math.floor(Math.random() * max);
	}



	this.extensionCommands[10] = function(newSize) // set bit depth
	{
		this.argumentSize = newSize;
	}
};

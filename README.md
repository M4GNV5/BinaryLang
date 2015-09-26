# BinaryLang
Cool people can write programs only with 0 and 1

You want to be cool? Be it [here](http://m4gnv5.github.io/BinaryLang/src/browser.html)

#How do i write code to be cool?
Every command has following layout `<4 bits command id> <arg1> <arg2> ...`
As we have 4 bits for defining the command we have 16 different commands (0-15) (listed below).
Each command takes a fixed amount of arguments. By default an argument is 8 bits long but the length can be changed by the 15. command (1111) to have turing completeness.

#Commands
Name | Decimal | Binary | Arguments
--- | --- | --- | ---
set | 0 | 0000 | address, value
copy | 1 | 0001 | address, destination
out | 2 | 0010 | address
read | 3 | 0011 | address, length
a += b | 4 | 0100 | a, b
a -= b | 5 | 0101 | a, b
a *= b | 6 | 0110 | a, b
a /= b | 7 | 0111 | a, b
start function | 8 | 1000 | id
end function | 9 | 1001 | 
jump if a == b | 10 | 1010 | a, b, func
jump if a != b | 11 | 1011 | a, b, func
jump if a < b | 12 | 1100 | a, b, func
jump if a > b | 13 | 1101 | a, b, func
jump | 14 | 1110 | func
extension functions | 15 | 1111 | selector, arg0, arg1

##Extension commands

Name | Decimal | Binary | Arguments
--- | --- | --- | ---
fields[fields[a]] = b | 0 | 0000 | a, b
fields[a] = fields[fields[b]] | 1 | 0001 | a, b
out int | 2 | 0010 | address
read int | 3 | 0011 | address
a %= b | 4 | 0100 | a, b
a <<= b | 5 | 0101 | a, b
a >>= b | 6 | 0110 | a, b
a *= -1 | 7 | 0111 | a
a = \|a\| | 8 | 1000 | a
a = random from 0 to b | 9 | 1001 | a, b
set bit depth | 10 | 1010 | newLength



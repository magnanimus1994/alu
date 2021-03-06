'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ALU = function () {
	function ALU() {
		_classCallCheck(this, ALU);

		this._overflowFlag = 0;
	}

	//Program assumes that inputs are eight item arrays of 1's and 0's, e.g. [0, 1, 1, 0, 0, 1, 1, 1].
	//Program assumes that opcodes are four digit, pseudo-binary numbers, e.g [0, 1, 1, 1].


	_createClass(ALU, [{
		key: 'run',
		value: function run(alpha, beta, opcode) {
			this._overflowFlag = 0;

			//0001 --> ADD
			if (!opcode[0] && !opcode[1] && !opcode[2] && opcode[3]) {
				return this.eightBitAddition(alpha, beta);
			}

			//0010 --> SUBTRACT
			else if (!opcode[0] && !opcode[1] && opcode[2] && !opcode[3]) {
					return this.eightBitSubtraction(alpha, beta);
				}

				//0011 --> INCREMENT ALPHA
				else if (!opcode[0] && !opcode[1] && opcode[2] && opcode[3]) {
						return this.increment(alpha);
					}

					//0100 --> INCREMENT BETA
					else if (!opcode[0] && opcode[1] && !opcode[2] && !opcode[3]) {
							return this.increment(beta);
						}

						//0101 --> DECREMENT ALPHA
						else if (!opcode[0] && opcode[1] && !opcode[2] && opcode[3]) {
								return this.decrement(alpha);
							}

							//0110 --> DECREMENT BETA
							else if (!opcode[0] && opcode[1] && opcode[2] && !opcode[3]) {
									return this.decrement(beta);
								}

								//0111 --> LOGICALLY NEGATE ALPHA
								else if (!opcode[0] && opcode[1] && opcode[2] && opcode[3]) {
										return this.lNegate(alpha);
									}

									//1000 --> LOGICALLY NEGATE BETA
									else if (opcode[0] && !opcode[1] && !opcode[2] && !opcode[3]) {
											return this.lNegate(beta);
										}

										//1001 --> ARITHMETICALLY NEGATE ALPHA
										else if (opcode[0] && !opcode[1] && !opcode[2] && opcode[3]) {
												return this.aNegate(alpha);
											}

											//1010 --> ARTIHMETICALLY NEGATE BETA
											else if (opcode[0] && !opcode[1] && opcode[2] && !opcode[3]) {
													return this.aNegate(beta);
												}
		}
	}, {
		key: 'eightBitAddition',
		value: function eightBitAddition(a, b) {

			//First the program must note the signs of the inputs.
			//The program will raise an overflow flag if there is carry into the sign bit.
			var overflowSignal = void 0;
			if (a[0] && b[0]) {
				overflowSignal = 0;
			} else if (!a[0] && !b[0]) {
				overflowSignal = 1;
			} else {
				overflowSignal = null;
			};

			//Because there is no bit carried into the first operation, only half adder is required.
			var output = Array(8);
			var temp = this.halfAdder(a[7], b[7]);
			output[7] = temp[0];

			//This is an abstraction of passing each of the remaining seven bits into full adders, while using the carry bits of previous sum in the operation for the following two bits.
			for (var i = 6; i > -1; i--) {
				temp = this.fullAdder(a[i], b[i], temp[1]);
				output[i] = temp[0];
			}

			//Checks for overflow
			output[0] === overflowSignal ? this._overflowFlag = 1 : this._overflowFlag = 0;
			this.checkOverflow();

			//Returns output
			return output;
		}
	}, {
		key: 'halfAdder',
		value: function halfAdder(a, b) {
			var sum = void 0;
			var carry = void 0;

			//An XOR and an AND together represent binary addition. 
			if ((a || b) && !(a && b)) {
				sum = 1;
				carry = 0;
			} else if (a && b) {
				sum = 0;
				carry = 1;
			} else {
				sum = 0;
				carry = 0;
			}
			return [sum, carry];
		}

		//Function passes default value of zero for carry bit for when this is the first operation performed.

	}, {
		key: 'fullAdder',
		value: function fullAdder(a, b) {
			var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

			//First, we calculate the sum of the inputs.
			var partialSum = this.halfAdder(a, b);

			//Then we account for an carryovers from adding lower digits.
			var carry = void 0;
			var fullSum = this.halfAdder(partialSum[0], c);
			partialSum[1] || fullSum[1] ? carry = 1 : carry = 0;
			return [fullSum[0], carry];
		}
	}, {
		key: 'eightBitSubtraction',
		value: function eightBitSubtraction(a, b) {
			//Subtraction can be accomplished by arithmetically negating the subtrahend and just performing addition.
			var subtrahend = this.aNegate(b);
			return this.eightBitAddition(a, subtrahend);
		}
	}, {
		key: 'increment',
		value: function increment(n) {
			return this.eightBitAddition(n, [0, 0, 0, 0, 0, 0, 0, 1]);
		}
	}, {
		key: 'decrement',
		value: function decrement(n) {
			return this.eightBitAddition(n, [1, 1, 1, 1, 1, 1, 1, 1]);
		}

		//Logical Negation, i.e. flipping all bits

	}, {
		key: 'lNegate',
		value: function lNegate(n) {
			var output = Array(8);

			//Abstraction of NOT gates for all bits
			for (var i = 0; i < 8; i++) {
				n[i] ? output[i] = 0 : output[i] = 1;
			}
			return output;
		}

		//Arithmetic Negation, i.e. two's complement of the input

	}, {
		key: 'aNegate',
		value: function aNegate(n) {
			var m = this.lNegate(n);
			return this.increment(m);
		}
	}, {
		key: 'checkOverflow',
		value: function checkOverflow() {
			if (this._overflowFlag) {
				console.log('***OVERFLOW ERROR***');
			}
		}
	}]);

	return ALU;
}();

exports.default = ALU;

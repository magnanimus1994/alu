class ALU {
	
	constructor() {
		this._overflowFlag = 0;
	}

	//Program assumes that inputs are eight item arrays of 1's and 0's, e.g. [0, 1, 1, 0, 0, 1, 1, 1].
	//Program assumes that opcodes are four digit, pseudo-binary numbers, e.g [0, 1, 1, 1].
	run(alpha, beta, opcode) {
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

	eightBitAddition(a, b) {

		
		//First the program must note the signs of the inputs.
		//The program will raise an overflow flag if there is carry into the sign bit.
		let overflowSignal;
		if (a[0] && b[0]) {overflowSignal = 0}
		else if (!a[0] && !b[0]) {overflowSignal = 1}
		else {overflowSignal = null};

		//Because there is no bit carried into the first operation, only half adder is required.
		let output = Array(8);
		let temp = this.halfAdder(a[7],b[7]);
		output[7] = temp[0];
		
		//This is an abstraction of passing each of the remaining seven bits into full adders, while using the carry bits of previous sum in the operation for the following two bits.
		for (let i = 6; i > -1; i--) {
			temp = this.fullAdder(a[i], b[i], temp[1]);
			output[i] = temp[0];
		}

		//Checks for overflow
		output[0] === overflowSignal ? this._overflowFlag = 1 : this._overflowFlag = 0;
		this.checkOverflow();
		
		//Returns output
		return output;
	}
	

	halfAdder(a,b) {
		let sum;
		let carry;
		
		//An XOR and an AND together represent binary addition. 
		if ((a || b) && !(a && b)) {
			sum = 1;
			carry = 0;
		}
		else if (a && b) {
			sum = 0;
			carry = 1;
		}
		else { 
			sum = 0;
			carry = 0;
		}
		return [sum, carry];
	}

	//Function passes default value of zero for carry bit for when this is the first operation performed.
	fullAdder(a, b, c = 0) {
		//First, we calculate the sum of the inputs.
		let partialSum = this.halfAdder(a,b);

		//Then we account for an carryovers from adding lower digits.
		let carry;
		let fullSum = this.halfAdder(partialSum[0], c);
		(partialSum[1] || fullSum[1]) ? carry = 1 : carry = 0;
		return [fullSum[0], carry];
	}

	eightBitSubtraction(a, b) {
			//Subtraction can be accomplished by arithmetically negating the subtrahend and just performing addition.
			let subtrahend = this.aNegate(b);
			return this.eightBitAddition(a, subtrahend);
	}

	increment(n) {
		return this.eightBitAddition(n, [0,0,0,0,0,0,0,1]);
	}

	decrement(n) {
		return this.eightBitAddition(n, [1,1,1,1,1,1,1,1]);
	}

	//Logical Negation, i.e. flipping all bits
	lNegate(n) {
		let output = Array(8);
		
		//Abstraction of NOT gates for all bits
		for (let i = 0; i < 8; i++) {
			n[i] ? output[i] = 0 : output[i] = 1;	
		}
		return output;
	}

	//Arithmetic Negation, i.e. two's complement of the input
	aNegate(n) {
		let m = this.lNegate(n);
		return this.increment(m);
	}
	
	checkOverflow() {
		if (this._overflowFlag) {console.log('***OVERFLOW ERROR***');}
	}

}

export default ALU;

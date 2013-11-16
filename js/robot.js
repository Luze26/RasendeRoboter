function Robot(column, line, color, map) {
	this.column = column;
	this.line = line;
	this.color = color;
	this.map = map;
	this.selected = false;
	this.moved = false;

	this.currentCell = map[line][column];
	this.currentCell.robot = this;
}

Robot.prototype.setColumn = function(column) {
	this.currentCell.robot = null;
	this.column = column;
	this.currentCell = this.map[this.line][column];
	this.currentCell.robot = this;
};

Robot.prototype.setLine = function(line) {
	this.currentCell.robot = null;
	this.line = line;
	this.currentCell = this.map[line][this.column];
	this.currentCell.robot = this;
};

Robot.prototype.canMoveUp = function() {
	return !(this.line == 0 || this.currentCell.h == 1 || this.map[this.line-1][this.column].b == 1 || this.map[this.line-1][this.column].robot != null);
};

Robot.prototype.canMoveDown = function() {
	return !(this.line == this.map.maxLine || this.currentCell.b == 1 || this.map[this.line+1][this.column].h == 1 || this.map[this.line+1][this.column].robot != null);
};

Robot.prototype.canMoveLeft = function() {
	return !(this.column == 0 || this.currentCell.g == 1 || this.map[this.line][this.column-1].d == 1 || this.map[this.line][this.column-1].robot != null);
};

Robot.prototype.canMoveRight = function() {
	return !(this.column == this.map.maxColumn || this.currentCell.d == 1 || this.map[this.line][this.column+1].g == 1 || this.map[this.line][this.column+1].robot != null);
};

/**
 * @ngdoc function
 * @name Robot#move
 * @methodOf Robot
 *
 * @description
 * Move the robot until it hits something. At the end of the move, checks if the proposition is valid, if
 * so, send the proposition to the server and display the result.
 *
 * @param {function} moveRobot Function to execute to move the robot
 * @param {robot} robotToMove Robot to move
 * @param {boolean} If it's the first call
 */
Robot.prototype.move = function(direction) {
	var moveFn;
	switch(direction) {
		case "UP":
			this.moveFn = this.moveUp;
			break;
		case "DOWN":
			this.moveFn = this.moveDown;
			break;
		case "RIGHT":
			this.moveFn = this.moveRight;
			break;
		case "LEFT":
			this.moveFn = this.moveLeft;
			break;
	}

	var moved = false;
	while(this.moveFn()) {
		this.moved = true;
		moved = true;
	}
	
	return moved;
};

Robot.prototype.moveLeft = function() {
	if(this.canMoveLeft()) {
		this.setColumn(this.column - 1);
		return true;
	}
	return false;
};

Robot.prototype.moveRight = function() {
	if(this.canMoveRight()) {
		this.setColumn(this.column + 1);
		return true;
	}
	return false;
};

Robot.prototype.moveDown = function() {
	if(this.canMoveDown()) {
		this.setLine(this.line + 1);
		return true;
	}
	return false;
};

Robot.prototype.moveUp = function() {
	if(this.canMoveUp()) {
		this.setLine(this.line - 1);
		return true;
	}
	return false;
};

Robot.prototype.isOnTarget = function() {
	return this.currentCell.target == this.color;
};

Robot.prototype.canMove = function(lastRobotMoved) {
console.log(lastRobotMoved);
	return !(this.moved == true && lastRobotMoved != this);
};
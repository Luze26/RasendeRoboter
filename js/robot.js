function Robot(column, line, color, map) {
	this.column = column;
	this.line = line;
	this.color = color;
	this.map = map;
	this.selected = false;
	this.moved = false;

	this.currentCell = map[line][column];
	this.currentCell.robot = this;
	this.cellSelected = [];
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

Robot.prototype.canMoveUp = function(line, column) {
	return !(line === 0 || this.map[line][column].h == 1 || this.map[line-1][column].b == 1 || this.map[line-1][column].robot != null);
};

Robot.prototype.canMoveDown = function(line, column) {
	return !(line == this.map.maxLine || this.map[line][column].b == 1 || this.map[line+1][column].h == 1 || this.map[line+1][column].robot != null);
};

Robot.prototype.canMoveLeft = function(line, column) {
	return !(column === 0 || this.map[line][column].g == 1 || this.map[line][column-1].d == 1 || this.map[line][column-1].robot != null);
};

Robot.prototype.canMoveRight = function(line, column) {
	return !(column == this.map.maxColumn || this.map[line][column].d == 1 || this.map[line][column+1].g == 1 || this.map[line][column+1].robot != null);
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
	
	if(moved) {
		this.hideTrail();
		this.showTrail();
	}
	
	return moved;
};

Robot.prototype.moveLeft = function() {
	if(this.canMoveLeft(this.line, this.column)) {
		this.setColumn(this.column - 1);
		return true;
	}
	return false;
};

Robot.prototype.moveRight = function() {
	if(this.canMoveRight(this.line, this.column)) {
		this.setColumn(this.column + 1);
		return true;
	}
	return false;
};

Robot.prototype.moveDown = function() {
	if(this.canMoveDown(this.line, this.column)) {
		this.setLine(this.line + 1);
		return true;
	}
	return false;
};

Robot.prototype.moveUp = function() {
	if(this.canMoveUp(this.line, this.column)) {
		this.setLine(this.line - 1);
		return true;
	}
	return false;
};

Robot.prototype.isOnTarget = function() {
	return this.currentCell.target == this.color;
};

Robot.prototype.canMove = function(lastRobotMoved) {
	return !(this.moved === true && lastRobotMoved != this);
};

Robot.prototype.unselect = function() {
	this.selected = false;
	this.hideTrail();
};

Robot.prototype.select = function() {
	this.selected = true;
	this.showTrail();
};

Robot.prototype.hideTrail = function() {
	var nbCells = this.cellSelected.length;
	for(var i = 0; i < nbCells; i++) {
		this.cellSelected[i].endpoint = false;
		this.cellSelected[i].trail = false;
	}
};

Robot.prototype.showTrail = function() {
	var i;
	this.cellSelected = [];
	if(this.canMoveUp(this.line, this.column)) {
		i = this.line - 1;
		while(this.canMoveUp(i, this.column)) {
			this.map[i][this.column].trail = true;
			this.cellSelected.push(this.map[i][this.column]);
			i--;
		}
		this.cellSelected.push(this.map[i][this.column]);
		this.map[i][this.column].endpoint = true;
	}
	
	if(this.canMoveDown(this.line, this.column)) {
		i = this.line + 1;
		while(this.canMoveDown(i, this.column)) {
			this.map[i][this.column].trail = true;
			this.cellSelected.push(this.map[i][this.column]);
			i++;
		}
		this.cellSelected.push(this.map[i][this.column]);
		this.map[i][this.column].endpoint = true;
	}
	
	if(this.canMoveLeft(this.line, this.column)) {
		i = this.column - 1;
		while(this.canMoveLeft(this.line, i)) {
			this.map[this.line][i].trail = true;
			this.cellSelected.push(this.map[this.line][i]);
			i--;
		}
		this.cellSelected.push(this.map[this.line][i]);
		this.map[this.line][i].endpoint = true;
	}
	
	if(this.canMoveRight(this.line, this.column)) {
		i = this.column + 1;
		while(this.canMoveRight(this.line, i)) {
			this.map[this.line][i].trail = true;
			this.cellSelected.push(this.map[this.line][i]);
			i++;
		}
		this.cellSelected.push(this.map[this.line][i]);
		this.map[this.line][i].endpoint = true;
	}
};
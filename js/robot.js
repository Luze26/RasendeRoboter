function Robot(column, line, color, map) {
	this.column = column;
	this.line = line;
	this.color = color;
	this.map = map;

	//Array of cells used to show the trail
	this.cellsSelected = [];
	this.currentCell = map[line][column]; //current cell where the robot is
	this.currentCell.robot = this;
}

//If the robot is selected
Robot.prototype.selected = false;
//If the robot has already moved
Robot.prototype.moved = false;
/** Cell reachable for each move **/
Robot.prototype.upCell = null;
Robot.prototype.downCell = null;
Robot.prototype.rightCell = null;
Robot.prototype.leftCell = null;

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
	var moved = false;
	switch(direction) {
		case "UP":
			if(this.upCell != null) {
				this.setLine(this.upCell);
				moved = true;
			}
			break;
		case "DOWN":
			if(this.downCell != null) {
				this.setLine(this.downCell);
				moved = true;
			}
			break;
		case "RIGHT":
			if(this.rightCell != null) {
				this.setColumn(this.rightCell);
				moved = true;
			}
			break;
		case "LEFT":
			if(this.leftCell != null) {
				this.setColumn(this.leftCell);
				moved = true;
			}
			break;
	}
	
	if(moved) {
		this.moved = true;
		this.hideTrail();
		this.showTrails();
	}
	
	return moved;
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
	this.showTrails();
};

Robot.prototype.hideTrail = function() {
	var nbCells = this.cellsSelected.length;
	for(var i = 0; i < nbCells; i++) {
		this.cellsSelected[i].endpoint = null;
		this.cellsSelected[i].trail = false;
	}
	this.cellsSelected = [];
};

Robot.prototype.showTrail = function(lStep, cStep, direction, lOrC) {
	if(this.canMoveFn(this.line, this.column)) {
		l = this.line + lStep;
		c = this.column + cStep;
		while(this.canMoveFn(l, c)) {
			this.map[l][c].trail = true;
			this.cellsSelected.push(this.map[l][c]);
			l += lStep;
			c += cStep;
		}
		this.cellsSelected.push(this.map[l][c]);
		this.map[l][c].endpoint = direction;
		
		if(lOrC === true) {
			return l;
		}
		return c;
	}
	return null;
};

Robot.prototype.showTrails = function() {
	this.canMoveFn = this.canMoveUp;
	this.upCell = this.showTrail(-1, 0, "UP", true);
	this.canMoveFn = this.canMoveDown;
	this.downCell = this.showTrail(1, 0, "DOWN", true);
	this.canMoveFn = this.canMoveRight;
	this.rightCell = this.showTrail(0, 1, "RIGHT", false);
	this.canMoveFn = this.canMoveLeft;
	this.leftCell = this.showTrail(0, -1, "LEFT", false);
};

Robot.prototype.reset = function(column, line) {
	this.currentCell.robot = null;
	this.unselect();
	this.moved = false;
	this.line = line;
	this.column = column;
	this.currentCell = this.map[line][column];
	this.currentCell.robot = this;
};
// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var icons = {
  blank: 'http://i.imgur.com/HM1e3Tbb.jpg',
  pressed: 'http://i.imgur.com/bGT8xGEb.jpg',
  exposedBomb: 'http://i.imgur.com/pTJ8Swhb.jpg',
  explodedBomb: 'http://i.imgur.com/UFmXprFb.jpg',
  flag: 'http://i.imgur.com/nLPvW15b.jpg',
  // Index is # of adjacent bombs
  bombs: [
    'http://i.imgur.com/Flqdqi1b.jpg', // 0
    'http://i.imgur.com/bM8oExob.jpg', // 1
    'http://i.imgur.com/bQKSbqYb.jpg', // 2
    'http://i.imgur.com/5jNcEeVb.jpg', // 3
    'http://i.imgur.com/BnxjHgHb.jpg', // 4
    'http://i.imgur.com/RaFrMYcb.jpg', // 5
    'http://i.imgur.com/GlwQOy0b.jpg', // 6
    'http://i.imgur.com/8ngsVa8b.jpg', // 7
    'http://i.imgur.com/lJ8P1wab.jpg'  // 8
  ]
};

var boardheight = 10;
var boardwidth = 15;
var noOfBombs = 15;

var vcell = React.createClass({displayName: 'cell',
  render: function() {
    var imgsrc;
    if( this.props.value == 'e' || this.props.value == 'b' ){
      imgsrc = icons.blank;
      if( this.props.flag ) imgsrc = icons.flag;
    }
    else if( this.props.value == 'B' ){
      imgsrc = icons.explodedBomb;
    }
    else if( this.props.value == 'E' ){
      imgsrc = icons.exposedBomb;
    }
    else{
      imgsrc = icons.bombs[this.props.value]
    }
      return React.createElement("div", {className: "cell",
                                          onClick: this.props.click.bind(null, this.props.xpos, this.props.ypos ),
                                          onContextMenu: this.props.rightclick.bind(null, this.props.xpos, this.props.ypos ),
                                          "data-xpos": this.props.xpos, 
                                          "data-ypos": this.props.ypos, 
                                          key: "celldiv"+this.props.xpos+"_"+this.props.ypos}, 
                                          [
                                            React.createElement("img", 
                                              {src: imgsrc, 
                                                key: "img"+this.props.xpos+"_"+this.props.ypos 
                                              }
                                            )
                                          ]);
    },
});

var board = React.createClass({
  displayName: 'board',
  handleClick: function(x, y){
    //console.log("x: " + x + "   y: " + y + "   val: " + this.getGridValue(x, y));
    if(this.state.isGameOver) return;
    if( this.getGridFlag(x, y) ) return;
    this.revealSpace(x, y);
  },
  handleRightClick: function(x, y, e){
    e.preventDefault();
    if(this.state.isGameOver) return;
    var tmpflag = this.getGridFlag(x, y);
    if(tmpflag) return this.setGridFlag(x, y, false);
    return this.setGridFlag(x, y, true);
  },
  gameOver: function(){
    this.setState({isGameOver: true});
    for( var i = 0; i < boardwidth; i++){
      for( var j = 0; j < boardheight; j++){
        if( this.getGridValue(i, j) == "b" ){
          this.setGridValue(i, j, "E");
        }
      }
    }
  },
  //return 1 - bomb
  //return 0 - empty
  checkSpace: function(x, y){
    var tmpval = this.getGridValue(x, y)
    if( tmpval == "b") return 1;
    return 0;
  },
  revealSpace: function(x, y){
    var tmpval = this.getGridValue(x, y);
    if(tmpval != "b" && tmpval != "e" ) return;
    if(this.checkSpace(x, y) === 1){
      this.setGridValue(x, y, "B");
      this.gameOver();
    }
    if(this.checkSpace(x, y) === 0){
      this.revealEmptySpace(x, y);
    }
  },
  revealEmptySpace: function(x, y){
    var tmpval = this.getGridValue(x, y);
    if(tmpval != "b" && tmpval != "e" ) return;
    var spaceTotal = 0;
    for( var a = -1; a < 2; a++){
      for( var b = -1; b < 2; b++){
        if( a !== 0 || b !== 0 ){
            spaceTotal += this.checkSpace(x + a, y + b);
        }
      }
    }
    this.setGridValue(x, y, spaceTotal);
    if(spaceTotal === 0){
      for( var a = -1; a < 2; a++){
        for( var b = -1; b < 2; b++){
          if( a !== 0 || b !== 0 ){
              this.revealEmptySpace(x + a, y + b);
          }
        }
      }
    }
  },
  generateGrid: function(){
    //grid values:
    //b - unclicked bomb
    //B - clicked bomb (game over)
    //E - unclicked exposed bomb (non-clicked game over bombs)
    //e - unclicked empty square
    //0-8 - clicked empty square (with renderable adjacency value)
    var grid = [];
    for( var y = 0; y < boardheight; y++ ){
      for( var x = 0; x < boardwidth; x++ ){
        grid.push(React.createElement(vcell, {xpos: x, ypos: y,
                                              click: this.handleClick,
                                              rightclick: this.handleRightClick,
                                              value: "e",
                                              flag: false,
                                              key: "cell"+x+"_"+y}));
      }
    }
    return grid;
  },
  getGridFlag: function(x, y){
    if(x >= 0 && x < boardwidth && y >= 0 && y < boardheight){
      return this.state.grid[y*boardwidth + x].props.flag;
    }
    return 0;
  },
  setGridFlag: function(x, y, flag){
    tmpGrid = this.state.grid;
    tmpGrid[y*boardwidth + x] = React.cloneElement(tmpGrid[y*boardwidth + x], {flag: flag});
    this.setState({grid: tmpGrid});
  },
  getGridValue: function(x, y){
    if(x >= 0 && x < boardwidth && y >= 0 && y < boardheight){
      return this.state.grid[y*boardwidth + x].props.value;
    }
    return 0;
  },
  setGridValue: function(x, y, val){
    tmpGrid = this.state.grid;
    tmpGrid[y*boardwidth + x] = React.cloneElement(tmpGrid[y*boardwidth + x], {value: val});
    this.setState({grid: tmpGrid});
  },
  placeBomb: function(){
    var a = getRandomInt(0, boardwidth);
    var b = getRandomInt(0, boardheight);
    if( this.getGridValue(a, b) == "b"){
      return this.placeBomb();
    }
    this.setGridValue(a, b, "b");
    return;
  },
  componentWillMount: function(){
    this.setState({grid: this.generateGrid(), isGameOver: false});
  },
  componentDidMount: function(){
    for( var i = 0; i < noOfBombs; i++){
      this.placeBomb();
    }
  },
  render: function(){
    var boardStyle = {width: boardwidth*20 + "px"};
    return React.createElement('div', {id: "board", style: boardStyle}, this.state.grid);
  }
});

ReactDOM.render(
  React.createElement(board),
  document.getElementById('container')
);

//console.log("done");

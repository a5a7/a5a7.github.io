const scene = new THREE.Scene({color: 0xffffff});

const chess = new Chess();
const size = 50;

document.getElementById('done').addEventListener('click', (e) => {
    var turn = document.getElementById('turn').checked;
    document.getElementById('options').style.display = 'none';
    if (!turn){
        SecondSearching();
    }
})

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.background = new THREE.Color(0xffffff)
const renderer = new THREE.WebGLRenderer();
const loader = new THREE.GLTFLoader();
const domEvents = new THREEx.DomEvents(camera, renderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);

var light = new THREE.AmbientLight();
var hemiLight = new THREE.HemisphereLight(0xffffff, 0x080808, 4)
var spotLight = new THREE.SpotLight(0xffa95c, 4);
scene.add( light );
scene.add(hemiLight);
scene.add(spotLight);
var CapturedArray = [];

renderer.setSize( window.innerWidth-2, window.innerHeight-3 );
document.body.appendChild( renderer.domElement );
renderer.toneMappingExposure = 2.3;
renderer.toneMapping = 2;

var PiecesMap = {};
var PiecesModels = {};
var rows = "abcdefgh";

function setPieceOnSq(piece, row, column){
    loader.load('../gltf/Pieces2/' + piece + ".gltf", function (gltf){
        gltf.scene.scale.x = 50;
        gltf.scene.scale.y = 50;
        gltf.scene.scale.z = 50;
        if (PiecesModels[piece] == undefined){
            PiecesModels[piece] = gltf.scene;
        }
        gltf.scene.position.set(size * (row-3.5), 25, size*(3.5-column));
        scene.add(gltf.scene);
        if (piece[0] == 'w'){
            gltf.scene.rotation.y = -Math.PI/2;
        }else{
            gltf.scene.rotation.y = Math.PI/2;
        }
        PiecesMap[rows[column]+(8-row)] = gltf.scene;
        gltf.scene.sq = rows[column]+(8-row);
        domEvents.bind(gltf.scene, "mousedown", function (obj){
            var mesh = obj.target;
            clicked(cubeMap[mesh.sq]);
        })
    }, undefined, function (err){})
}
function LoadBoard(){
    var board = chess.board();
    for (var i = 0; i < 8; i++){
        for (var j = 0; j < 8; j++){
            if (board[i][j] == null) continue;
            if (board[i][j].color == 'w'){
                setPieceOnSq("w" + board[i][j].type.toUpperCase(), i, j);
            }else{
                setPieceOnSq("b" + board[i][j].type.toUpperCase(), i, j);
            }
        }
    }
}
LoadBoard();
/*
loader.load( '../gltf/wN.gltf', function ( gltf ) {
	scene.add( gltf.scene );
    console.log(gltf.scene);
    gltf.scene.scale.x = 50;
    gltf.scene.scale.y = 50;
    gltf.scene.scale.z = 50;
}, undefined, function ( error ) {
	console.error( error );
} );*/

/*
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );*/
var cubeMap = {};
var colors = [0xffffff, 0x202020]
for (var i = 0; i < 8; i++){
    for (var j = 0; j < 8; j++){
        var geometry = new THREE.BoxGeometry(size, size, size);
        var material = new THREE.MeshBasicMaterial({color: colors[(i+j)%2]});
        var cube = new THREE.Mesh(geometry,material);
        cube.position.x = size * (i - 3.5);
        cube.position.z = size * (j - 3.5);
        scene.add(cube);
        cubeMap[rows[7-j] + (8-i)] = cube;
        cube["sq"] = (rows[7-j] + (8-i));
        cube.light = ((i+j)%2);
        domEvents.bind(cube, "mousedown", function (obj){
            var mesh = obj.target;
            clicked(mesh);
        })
    }
}
var geometry = new THREE.BoxGeometry(size * 9, size, size*9);
var material = new THREE.MeshBasicMaterial({color: 0x65350f});
var cube = new THREE.Mesh(geometry,material);
cube.position.y = -10;
scene.add(cube);
camera.position.z = 400;
camera.position.y = 400;

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    spotLight.position.set(camera.position.x+10, camera.position.y+10, camera.position.z+10);
    renderer.render(scene, camera);
}
animate();

var start = undefined;
var squaresTo = [];
var oldSquares = [];
var searchedMove = false;
function clicked(mesh){
    if (start == undefined){
        if (chess.get(mesh.sq) == null){
            return;
        }else if (chess.get(mesh.sq).color == chess.turn()){
            start = mesh.sq;
            if (oldSquares.length != 0){
                cubeMap[oldSquares[0]].material.color.set(colors[cubeMap[oldSquares[0]].light]);
                cubeMap[oldSquares[1]].material.color.set(colors[cubeMap[oldSquares[1]].light]);
            }
            mesh.material.color.setRGB(255, 0, 0);
            squaresTo = [];
            var sqs = chess.moves({square: mesh.sq, verbose: true});
            for (var x of sqs){
                squaresTo.push(x.to);
                var col = [0x00ff00,0x009a00];
                if (cubeMap[x.to].material.color.r == 0){
                    cubeMap[x.to].material.color.setRGB(0, 155, 0);
                }else{
                    cubeMap[x.to].material.color.setRGB(0, 255, 0)
                }
                cubeMap[x.to].material.color.set(col[cubeMap[x.to].light])
            }
        }
    }else{
        var sq = mesh.sq;
        if (squaresTo.includes(sq)){
            var m = chess.move(start + sq, {sloppy: true});
            if (m.flags == "k"){
                if (m.color == 'w'){
                    var rook = PiecesMap['h1'];
                    rook.position.set(175,25,-75);
                    rook.sq = 'f1';
                    PiecesMap['h1'] = null;
                    PiecesMap['f1'] = rook;
                }else{
                    var rook = PiecesMap['h8'];
                    rook.position.set(-175, 25, -75);
                    rook.sq = 'f8';
                    PiecesMap['h8'] = null;
                    PiecesMap['f8'] = rook;
                }
            }else if (m.flags == 'q'){
                if (m.color == 'w'){
                    var rook = PiecesMap['a1'];
                    rook.position.set(175, 25, 25);
                    rook.sq = 'd1';
                    PiecesMap['a1'] = null;
                    PiecesMap['d1'] = rook;
                }else{
                    var rook = PiecesMap['a8'];
                    rook.position.set(-175, 25, 25);
                    rook.sq = 'd8';
                    PiecesMap['a8'] = null;
                    PiecesMap['d8'] = rook;
                }
            }
            if (m.flags.includes('c')){
                var c = PiecesMap[sq];
                PiecesMap[sq] = null;
                c.visible = false;
                CapturedArray.push(c);
            }
            if (m.flags.includes('e')){
                var enPassantSq = {
                    "a3": 'a4',
                    "b3": 'b4',
                    "c3": 'c4',
                    "d3": 'd4',
                    "e3": 'e4',
                    "f3": 'f4',
                    "g3": 'g4',
                    "h3": 'h4',
                    "a6": 'a5',
                    "b6": 'b5',
                    "c6": 'c5',
                    "d6": 'd5',
                    "e6": 'e5',
                    "f6": 'f5',
                    "g6": 'g5',
                    "h6": 'h5'
                }
                var s = enPassantSq[m.to];
                var c = PiecesMap[s];
                PiecesMap[s] = null;
                c.visible = false;
                CapturedArray.push(c);
            }
            var obj = PiecesMap[start];
            var row = rows.indexOf(sq[0]);
            var col = parseInt(sq[1]);
            obj.sq = sq;
            obj.position.set(size*(4.5-col), 25, size*(3.5-row));
            PiecesMap[start] = null;
            PiecesMap[sq] = obj;
            for (var x of squaresTo){
                cubeMap[x].material.color.set(colors[cubeMap[x].light]);
            }
            cubeMap[start].material.color.set(0xe0cc12);
            cubeMap[sq].material.color.set(0xebd936);
            oldSquares = [start, sq];
            start = undefined;
            squaresTo = [];
            if (m.flags.includes('p')){
                var c = PiecesMap[sq];
                var currentTurn = chess.turn() == 'w' ? 'b' : 'w';
                var model = PiecesModels[currentTurn + "Q"].clone();
                model.position.set(c.position.x, c.position.y, c.position.z);
                console.log(model);
                scene.add(model);
                scene.remove(c);
                model.scale.set(50, 50, 50);
                model[sq] = sq;
                PiecesMap[sq] = model;
            }
            if (chess.game_over()){
                if (chess.in_check()){
                    if (chess.turn() == 'w'){
                        document.getElementById('info').innerHTML = "Black won!"
                    }else{
                        document.getElementById('info').innerHTML = "White won!"
                    }
                }else{
                    document.getElementById('info').innerHTML = "Draw!"
                }
            }
            if (!searchedMove){
                setTimeout(() => {
                    SecondSearching();
                }, 20);
            }else{
                searchedMove = false;
            }
        }else if (sq == start){
            for (var x of squaresTo){
                cubeMap[x].material.color.set(colors[cubeMap[x].light]);
            }
            cubeMap[start].material.color.set(colors[cubeMap[start].light]);
            start = undefined;
            squaresTo = [];
            cubeMap[oldSquares[0]].material.color.set(0xe0cc12);
            cubeMap[oldSquares[1]].material.color.set(0xebd936);
        }else if (chess.get(sq) != null && chess.get(sq).color == chess.turn()){
            for (var x of squaresTo){
                cubeMap[x].material.color.set(colors[cubeMap[x].light]);
            }
            cubeMap[start].material.color.set(colors[cubeMap[start].light]);
            start = sq;
            mesh.material.color.setRGB(255, 0, 0);
            squaresTo = [];
            var sqs = chess.moves({square: mesh.sq, verbose: true});
            for (var x of sqs){
                squaresTo.push(x.to);
                var col = [0x00ff00,0x009a00];
                if (cubeMap[x.to].material.color.r == 0){
                    cubeMap[x.to].material.color.setRGB(0, 155, 0);
                }else{
                    cubeMap[x.to].material.color.setRGB(0, 255, 0)
                }
                cubeMap[x.to].material.color.set(col[cubeMap[x.to].light])
            }
        }else{
            return;
        }
    }
}
function random_game(){
    var random = setInterval(() => {
        if (chess.game_over()){
            clearInterval(random);
        }
        var moves = chess.moves({verbose: true});
        var move = moves[Math.floor(Math.random() * moves.length)];
        clicked(cubeMap[move.from]);
        clicked(cubeMap[move.to]);
    }, 100)
}
function ai_game(){
    var random = setInterval(() => {
        if (chess.game_over()){
            clearInterval(random);
        }
        SecondSearching();  
    }, 500)
}
// NEGAMAX // AI // EVAL // SEARCH
var typeValues = {p: 100, n: 300, b: 300, r: 500, q: 900, k: 20000};
var side = {b: -1, w: 1};
var tables = {};
var ttTable = {};
var pos = 0;
var posKey = 0;
var PieceKeys = [];
var b = 6;
var w = 0;
var moveTable = {};
var pst_w = {
    'p':[
            [ 100, 100, 100, 100, 105, 100, 100,  100],
            [  78,  83,  86,  73, 102,  82,  85,  90],
            [   7,  29,  21,  44,  40,  31,  44,   7],
            [ -17,  16,  -2,  15,  14,   0,  15, -13],
            [ -26,   3,  10,   9,   6,   1,   0, -23],
            [ -22,   9,   5, -11, -10,  -2,   3, -19],
            [ -31,   8,  -7, -37, -36, -14,   3, -31],
            [   0,   0,   0,   0,   0,   0,   0,   0]
        ],
    'n': [ 
            [-66, -53, -75, -75, -10, -55, -58, -70],
            [ -3,  -6, 100, -36,   4,  62,  -4, -14],
            [ 10,  67,   1,  74,  73,  27,  62,  -2],
            [ 24,  24,  45,  37,  33,  41,  25,  17],
            [ -1,   5,  31,  21,  22,  35,   2,   0],
            [-18,  10,  13,  22,  18,  15,  11, -14],
            [-23, -15,   2,   0,   2,   0, -23, -20],
            [-74, -23, -26, -24, -19, -35, -22, -69]
        ],
    'b': [ 
            [-59, -78, -82, -76, -23,-107, -37, -50],
            [-11,  20,  35, -42, -39,  31,   2, -22],
            [ -9,  39, -32,  41,  52, -10,  28, -14],
            [ 25,  17,  20,  34,  26,  25,  15,  10],
            [ 13,  10,  17,  23,  17,  16,   0,   7],
            [ 14,  25,  24,  15,   8,  25,  20,  15],
            [ 19,  20,  11,   6,   7,   6,  20,  16],
            [ -7,   2, -15, -12, -14, -15, -10, -10]
        ],
    'r': [  
            [ 35,  29,  33,   4,  37,  33,  56,  50],
            [ 55,  29,  56,  67,  55,  62,  34,  60],
            [ 19,  35,  28,  33,  45,  27,  25,  15],
            [  0,   5,  16,  13,  18,  -4,  -9,  -6],
            [-28, -35, -16, -21, -13, -29, -46, -30],
            [-42, -28, -42, -25, -25, -35, -26, -46],
            [-53, -38, -31, -26, -29, -43, -44, -53],
            [-30, -24, -18,   5,  -2, -18, -31, -17]
        ],
    'q': [   
            [  6,   1,  -8,-104,  69,  24,  88,  26],
            [ 14,  32,  60, -10,  20,  76,  57,  24],
            [ -2,  43,  32,  60,  72,  63,  43,   2],
            [  1, -16,  22,  17,  25,  20, -13,  -6],
            [-14, -15,  -2,  -5,  -1, -10, -20, -22],
            [-30,  -6, -13, -11, -16, -11, -16, -27],
            [-36, -18,   0, -19, -15, -15, -21, -38],
            [-39, -30, -31, -13, -31, -36, -34, -42]
        ],
    'k': [  
            [  4,  54,  47, -99, -99,  60,  83, -62],
            [-32,  10,  55,  56,  56,  55,  10,   3],
            [-62,  12, -57,  44, -67,  28,  37, -31],
            [-55,  50,  11,  -4, -19,  13,   0, -49],
            [-55, -43, -52, -28, -51, -47,  -8, -50],
            [-47, -42, -43, -79, -64, -32, -29, -32],
            [ -4,   3, -14, -50, -57, -18,  13,   4],
            [ -1,  30,  -3, -14,   6,  2,  40,  -1]
        ]
};
document.addEventListener('keydown', (e) => {
    if (e.key == 'm'){
        IterativeSearch();
    }
})
var ttc = 0;
var order = "pnbrkq";
var numKeys = {};
for (var i = 0; i < 6; i++){
    var piece = Object.keys(typeValues)[i];
    for (var j = 0; j < 2; j++){
        var color = 'bw'[j];
        var table = [];
        for (var a = 0; a < 8; a++){
            var arr = [];
            for (var b = 0; b < 8; b++){
                arr.push(Math.floor(Math.random() * 0xffffffff));
            }
            table.push(arr);
        }
        numKeys[color + piece] = table;
    }
}
var key = 0;
function Evaluate(){
    string = '';
    var board = chess.board();
    var score = 0;
    var k = {
        wK: [],
        bK: [],
    }
    for (var i = 0; i < 8; i++){
        for (var j = 0; j < 8; j++){
            if (board[i][j] == null) {continue;};
            var piece = board[i][j];
            if (piece.type == 'k'){
                k[piece.color + "K"] = [i, j];
            }
            score += side[piece.color] * typeValues[piece.type];
            score += (pst_w[piece.type][(side[piece.color] * (i-3.5) + 3.5)][side[piece.color] * (j-3.5) + 3.5] * side[piece.color])/10;
        }
    }
    if (k.wK.length == 0 || k.bK.length == 0) return score * side[chess.turn()];
    var kEval = 0;
    var opppositeKing = chess.turn() == 'w' ? k["bK"] : k["wK"];
    var king = k[chess.turn() +"K"];
    var center1 = Math.max(opppositeKing[0]-4, 3-opppositeKing[0]);
    var center3 = Math.max(king[0]-4, 3-king[0]);
    var center2 = Math.max(opppositeKing[1]-4, 3-opppositeKing[1]);
    var center4 = Math.max(king[1]-4, 3-king[1]);
    kEval += center1 + center2 - (center3 + center4)/4;
    var dist1 = Math.abs(k.wK[0] - k.bK[0]);
    var dist2 = Math.abs(k.wK[1] - k.bK[1]);
    var dist = dist1 + dist2;
    kEval += 14-dist;
    return score * side[chess.turn()] + kEval * 10 * (Math.abs(score)/1000);
}
function SearchCaptures(a, b){
    var eval = Evaluate();
    if (eval >= b){
        return b;
    }
    a = Math.max(a, eval);
    if (eval < a - typeValues.q){
        kmc++;
        return a;
    }
    var moves = chess.ugly_moves();
    moves.sort((a, b) => {
        var MoveValue = (m) => {
            var start = typeValues[m.piece];
            var end = m.captured == undefined ? 0 : typeValues[m.captured];
            return start - end;
        }
        return MoveValue(a) - MoveValue(b);
    })
    for (var x of moves){
        if (x.captured == undefined) continue;
        chess.ugly_move(x);
        eval = -SearchCaptures(-b, -a);
        chess.undo();
        if (eval >= b){
            return b;
        }
        a = Math.max(a, eval);
    }
    return a;
}
function Search(depth, alpha, beta){
    if (depth == 0){
        pos++;
        return SearchCaptures(alpha, beta);
    }
    var fen = chess.fen();
    var moves = moveTable[fen] == undefined ?  chess.ugly_moves() : moveTable[fen];
    moveTable[fen] = moves;
    moves.sort((a, b) => {
        var MoveValue = (m) => {
            var start = typeValues[m.piece];
            var end = m.captured == undefined ? 0 : typeValues[m.captured];
            return start - end;
        }
        return MoveValue(a) - MoveValue(b);
    })
    if (moves.length == 0 || chess.game_over()){
        if (chess.in_check()){
            return -20100;
        }
        return 0;
    }
    var z = null;
    for (var x of moves){
        chess.ugly_move(x);
        var Eval = -Search(depth-1, -beta, -alpha);
        var m = chess.history().pop();
        chess.undo();
        if (Eval >= beta){
            return beta;
        }
        if (Eval > alpha){
            z = m;
            alpha = Eval;
        }
    }
    tables[fen] = z;
    return alpha;
}
var pos = 0;
var abc = 0;
var ttc = 0;
var kmc = 0;
var nmc = 0;
var searchDepth = 0;
var valueTable = [];
var killerMoves = [[], [], [], [], []]; // DEPTH => 
function SearchSecond(depth, alpha, beta){
    if (depth == 0){
        pos++;
        return [SearchCaptures(alpha,beta)];
    }
    var moves = chess.ugly_moves();
    
    if (moves.length == 0 || chess.game_over()){
        if (chess.in_check()){
            return [-20100];
        }
        return [0];
    }
    
    moves.sort((a, b) => {
        var MoveValue = (m) => {
            var start = typeValues[m.piece];
            var end = m.captured == undefined ? 0 : typeValues[m.captured];
            return start - end;
        }
        return (MoveValue(a) - MoveValue(b));
    })
    var z = null;
    for (var x of moves){
        chess.ugly_move(x);
        var Eval = (SearchSecond(depth-1, -beta, -alpha));
        Eval = -Eval[0];
        chess.undo();
        if (Eval >= beta){
            abc++;
            return [beta];
        }
        if (Eval > alpha){
            z = chess.ALG(x.from) + chess.ALG(x.to);
            alpha = Eval;
        }
    }
    return [alpha, z];
}

function SecondSearching(){
    var moveList = "";
    for (var x of chess.history()){
        moveList += x + " ";
    }
    kmcs = [[], [], [], [], []];
    if (chess.turn() == 'b'){
        // GO BACKWARDS
        for (var i = WhiteToBlack.length-1; i > -1; i--){
            if (WhiteToBlack[i].slice(0, moveList.length) == moveList){
                var moves = WhiteToBlack[i].split(" ");
                var num = chess.history().length;
                if (num >= moves.length-1){ continue };
                var move = moves[num];
                var m = chess.move(move)
                chess.undo();
                searchedMove = true;
                console.log(move);
                clicked(cubeMap[m.from]);
                clicked(cubeMap[m.to]);
                return;
            }
        }
    }else{
        for (var i = 0; i < WhiteToBlack.length; i++){
            if (WhiteToBlack[i].slice(0, moveList.length) == moveList){
                var moves = WhiteToBlack[i].split(" ");
                var num = chess.history().length;
                if (num >= moves.length-1){ continue };
                var move = moves[num];
                var m = chess.move(move)
                chess.undo();
                searchedMove = true;
                console.log(move);
                clicked(cubeMap[m.from]);
                clicked(cubeMap[m.to]);
                return;
            }
        }
    }
    var bm =0;
    for (var i = 1; i < 3; i++){
        pos = 0;
        abc = 0;
        ttc = 0;
        kmc = 0;
        nmc = 0;
        searchDepth = i;
        killerMoves[i] = [];
        var t1 = performance.now();
        var search = SearchSecond(i, -Infinity, Infinity);
        var t2 = performance.now();
        console.log("DEPTH: " + i);
        console.log("TIME: " + (t2- t1));
        console.log("MOVE: " + search[1]);
        console.log("VALUE: " + search[0]);
        console.log("POSITIONS: " + pos);
        console.log("CUTOFFS: ");
        console.log("  ABP: " + abc);
        console.log("  TTC: " + ttc);
        console.log("  KMH: " + kmc);
        console.log("  NMH: " + nmc);
        console.log(" TOTAL: " + (abc + ttc + kmc + nmc));
        console.log("");
        bm = search[1];
    }
    searchedMove = true;
    clicked(cubeMap[bm[0] + bm[1]]);
    clicked(cubeMap[bm[2] + bm[3]]);
    console.log(bm);
}
var evaluation = 0;
function IterativeSearch(){
    var f = chess.fen();
    var bestMove = 0;
    // CHECK FOR BOOK MOVE
    var moveList = "";
    for (var x of chess.history()){
        moveList += x + " ";
    }
    if (chess.turn() == 'b'){
        // GO BACKWARDS
        for (var i = WhiteToBlack.length-1; i > -1; i--){
            if (WhiteToBlack[i].slice(0, moveList.length) == moveList){
                var moves = WhiteToBlack[i].split(" ");
                var num = chess.history().length;
                if (num >= moves.length-1){ continue };
                var move = moves[num];
                var m = chess.move(move)
                chess.undo();
                searchedMove = true;
                console.log(move);
                clicked(cubeMap[m.from]);
                clicked(cubeMap[m.to]);
                return;
            }
        }
    }else{
        for (var i = 0; i < WhiteToBlack.length; i++){
            if (WhiteToBlack[i].slice(0, moveList.length) == moveList){
                var moves = WhiteToBlack[i].split(" ");
                var num = chess.history().length;
                if (num >= moves.length-1){ continue };
                var move = moves[num];
                var m = chess.move(move)
                chess.undo();
                searchedMove = true;
                console.log(move);
                clicked(cubeMap[m.from]);
                clicked(cubeMap[m.to]);
                return;
            }
        }
    }
    for (var i = 1; i < 3; i++){
        pos = 0;
        ttc = 0;
        var t1 = performance.now();
        var s = Search(i, -Infinity, Infinity);
        var t2 = performance.now();
        console.log("DEPTH: " + i);
        console.log("TIME: " + (t2 - t1));
        console.log("VALUE: " + s);
        console.log("MOVE: " + tables[f]);
        console.log("POSITION: " + pos)
        console.log("TTC: " + ttc);
        console.log("")
        bestMove = tables[f];
    }
    var m = chess.move(bestMove);
    chess.undo();
    searchedMove = true;
    console.log(m);
    clicked(cubeMap[m.from]);
    clicked(cubeMap[m.to]);
    return m;
}
function aivsai(){
    game = setInterval(() => {
        if (chess.game_over()){
            clearInterval(game);
        }
        IterativeSearch();
    }, 500)
}

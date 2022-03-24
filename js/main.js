'use strict'
const MINE = '💩'
const MARK = '⛳'
const EMPTY = ''
const LIFE = '❤️'
const NOT_HAPPY = '🤯'
const HAPPY = '😎'
const NORMAL = '🙂'
var gElSmile = document.querySelector('.smile')
var gSound = document.getElementById('sound')
var gElHeart = document.querySelector('.heart')
var gBoard
var gStartTime
var gTimerInterval
var gHeartCount
var gLevel = { size: 4, mines: 2 };
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
}


function init(size = gLevel.size, mines = gLevel.mines) {
    gSound.pause()
    gSound.currentTime = 0
    clearInterval(gTimerInterval)
    gStartTime = null
    gElSmile.innerText = NORMAL
    gHeartCount = 3
    gElHeart.innerText = '❤️❤️❤️'
    gGame.isOn = true
    gLevel.size = size
    gLevel.mines = mines
    gGame.markedCount = 0
    gGame.shownCount = 0
    createBoard()
    renderMat(gBoard)

}

function createBoard() {
    gBoard = createMat(gLevel.size)

}

function createMines(i, j) {
    var cells = getEmptyCells(i, j)
    for (var m = 0; m < gLevel.mines; m++) {
        var cell = cells.splice(getRandomInt(0, cells.length), 1)[0]
        gBoard[cell.i][cell.j].isMine = true
    }

}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) continue
            var minesCount = countMinesNeighbors(gBoard, i, j)
            if (!minesCount) minesCount = ''
            gBoard[i][j].minesAroundCount = minesCount
        }
    }


}

function renderMat(mat) {
    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = ''
            var className = 'cell cell-' + i + '-' + j;
            strHTML += `<td class="${className}"  oncontextmenu="cellRightClicked(event,this,${i},${j})"
             onclick="cellClicked(this,${i},${j})">${cell} </td>`
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
}

function createMat(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            row.push({
                isMine: false,
                isMarked: false,
                minesAroundCount: null,
                isShown: false,
                location: { i: i, j: j }
            })
        }
        mat.push(row)
    }
    return mat
}

function countMinesNeighbors(board, idxI, idxJ) {
    var count = 0
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i > board.length - 1) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (i === idxI && j === idxJ) continue
            if (j < 0 || j > board[i].length - 1) continue
            if (board[i][j].isMine) count++
        }
    }
    return count
}


function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (!gStartTime) {
        createMines(i, j)
        setMinesNegsCount()
        // renderMat(gBoard)
        startTimer()
    }
    var location = { i: i, j: j }
    var currCell = gBoard[i][j]
    if (currCell.isMarked) return
    if (currCell.isShown) return
    if (currCell.isMine) loss()
    if (currCell.minesAroundCount) {
        currCell.isShown = true
        gGame.shownCount++
        renderCell(location, currCell.minesAroundCount)
        elCell.style.border = '1px rgb(255, 255, 255) solid'
        if (isVictory()) victory()
    } else if (!currCell.minesAroundCoun && !currCell.isMine) {
        currCell.isShown = true
        gGame.shownCount++
        elCell.style.border = '1px rgb(255, 255, 255) solid'
        expand(i, j)
        if (isVictory()) victory()
    }
}

function expand(i, j) {
    var neighbors = getNeighbors(gBoard, i, j)
    for (var i = 0; i < neighbors.length; i++) {
        var currNeighbor = neighbors[i]
        var curI = currNeighbor.location.i
        var curj = currNeighbor.location.j
        if (gBoard[curI][curj].isMarked) continue
        var elNeighbor = document.querySelector(`.cell-${curI}-${curj}`)
        elNeighbor.style.border = '1px rgb(255, 255, 255) solid'
        if (!gBoard[curI][curj].isShown) {
            gGame.shownCount++
            gBoard[curI][curj].isShown = true;
            if (!currNeighbor.minesAroundCount) expand(curI, curj)
        }
        renderCell(currNeighbor.location, currNeighbor.minesAroundCount);
    }
}



function cellRightClicked(ev, elCell, i, j) {
    ev.preventDefault();
    if (!gGame.isOn) return
    if (!gStartTime) return
    var location = { i: i, j: j }
    var currCell = gBoard[i][j]
    if (currCell.isShown) return
    if (!currCell.isMarked) {
        if (gGame.markedCount === gLevel.mines) return
        currCell.isMarked = true
        gGame.markedCount++
        renderCell(location, MARK)
        if (isVictory()) victory()
    } else {
        currCell.isMarked = false
        gGame.markedCount--
        renderCell(location, EMPTY)
    }
}

function loss() {
    if (gHeartCount) {
        gHeartCount--
        var strText = ''
        for (var i = 0; i < gHeartCount; i++) {
            strText += LIFE
        }
        if (!strText) {
            gElHeart.innerText = '⚠️'
            return
        }
        gElHeart.innerText = strText
        return
    }
    gElSmile.innerText = NOT_HAPPY
    gGame.isOn = false
    gSound.play()
    clearInterval(gTimerInterval)
    var mines = getMines()
    for (var i = 0; i < mines.length; i++) {
        renderCell(mines[i].location, MINE)
    }
}

function getMines() {
    var mines = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine) mines.push(currCell)
        }
    }
    return mines
}

function victory() {
    gElSmile.innerText = HAPPY
    gGame.isOn = false
    clearInterval(gTimerInterval)
}

function isVictory() {
    return (gGame.markedCount + gGame.shownCount === gLevel.size ** 2)
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(timer, 1000, '.timer')
}

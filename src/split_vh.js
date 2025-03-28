import Split from 'split.js'


export default function(typeDirection = 'horizontal', numCols = 3) {
    let colsArr = ['#split-0', '#split-1', '#split-2'];
    let extraOpcions = {};
    if(numCols===2){
        colsArr = colsArr.slice(0,2);
    }
    if(numCols===1){
        colsArr = colsArr.slice(0,1);
    }
    if(typeDirection == 'vertical')extraOpcions = { direction: typeDirection };
    Split(colsArr, extraOpcions);
}
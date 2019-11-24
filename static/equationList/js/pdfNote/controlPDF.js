let __PDF_DOC
let __PAGE_RENDERING_IN_PROGRESS = 0

let __CURRENT_PAGE = 1
let __TOTAL_PAGES;

let totalPage = document.querySelector("#totalPage")
let truePdfNumber = document.querySelector(".truePdfNumber")
let pdfPageInputBox = document.querySelector("#pdf-page")
pdfPageInputBox.value = 1
let beforeTrigger = true
let line = document.querySelector(".line")
let canvasContainer = document.querySelector(".canvasContainer")
// let canvas = document.querySelector("#canvas")
// let canvasCtx = canvas.getContext('2d');

function showBatchPage(startPage, loadNumber=5){
    let endPage = startPage + loadNumber
    beforeTrigger = true
    for (let i = startPage; i<endPage; i++){
        showPage(i)
    }
}


let testTextLayer;
let testAnnotation;
function showPage(pageNumber){
    __PDF_DOC.getPage(pageNumber).then(function(page) {
        let viewport = page.getViewport(1.55);

        let canvasDIV = document.createElement("div")
        canvasDIV.classList.add("canvasDIV")
        canvasDIV.style.position = "relative"

        let canvasBottomLine = document.createElement("div")
        canvasBottomLine.classList.add("canvasBottomLine")

        canvasBottomLine.style.width="100%"
        canvasBottomLine.style.height="10px"
        canvasBottomLine.style.position = "relative"
        canvasBottomLine.style.top = "-10px"
        // canvasBottomLine.style.background = "green"
        canvasBottomLine.style.zIndex = 100
        canvasBottomLine.pageNumber = pageNumber+1
        canvasBottomLine.triggered = false


        let canvas = document.createElement("canvas")
        let canvasCtx = canvas.getContext("2d")
        let textLayer = document.createElement("div")


        canvasDIV.append(canvas, textLayer)
        canvasContainer.append(canvasDIV, canvasBottomLine)

        textLayer.classList.add("textLayer")
        textLayer.pageNumber = pageNumber
        textLayer.style.width = viewport.width+"px"
        textLayer.style.minHeight = viewport.height+"px"
        // textLayer.style.background = "rgba(10, 10, 10, 0.5)"
        textLayer.style.position = "absolute"
        // textLayer.offsetTop = canvas.offsetTop
        textLayer.style.left = 0
        textLayer.style.top = 0


        canvas.width = viewport.width
        canvas.height = viewport.height

        // page is rendered on a <canvas> element
        var renderContext = {
           canvasContext: canvasCtx,
           viewport: viewport
        };

        page.render(renderContext).then(function() {
           return page.getTextContent();
        }).then(function(textContent) {
            PDFJS.renderTextLayer({
                textContent: textContent,
                container: textLayer,
                viewport: viewport,
                textDivs: []
            });
        }).then(function(){
            let startPosition;
            let dragging = false
            let endPosition;
            let newBlock;
            let movePosition;
            let textLayerDivArray = textLayer.querySelectorAll("div")
            let textLayerOffSetX;
            let textLayerOffSetY;    // to get the position data of the textlayer so that we can get the relative position
            textLayerDivArray.forEach(div=>{
                div.style.pointerEvents = "none"
            })


            function newBlockCreate(){
                let newBlock = document.createElement("span")
                newBlock.classList.add("annotationBlock")
                newBlock.style.position = "absolute"


                return newBlock
            }

            textLayer.addEventListener("click", function(){
                if (!startPosition){
                    console.log("startPosition");
                    textLayerPositionData = textLayer.getClientRects()[0]
                    textLayerOffSetX = textLayerPositionData["x"]
                    textLayerOffSetY = textLayerPositionData["y"]

                    startPosition = [event.clientX-textLayerOffSetX, event.clientY- textLayerOffSetY]

                    newBlock = newBlockCreate()
                    textLayer.append(newBlock)

                    dragging = true
                } else if (!endPosition){
                    console.log(newBlock.dimensionOutput);
                    console.log("finalPosition");
                    console.log(endPosition);
                    console.log(document.querySelector(".annotationBlock"));

                    dragging = false
                    // textLayer.append(newBlock.cloneNode())
                    newBlock = 0
                    startPosition = 0
                    endPosition = 0
                    movePosition = 0

                    testTextLayer = textLayer
                    testAnnotation = newBlock

                }
            })

            textLayer.addEventListener("mousemove", function(){
                if (dragging){

                    console.log(textLayerPositionData["x"]);
                    movePosition = [event.clientX-textLayerOffSetX, event.clientY- textLayerOffSetY]
                    let width = movePosition[0] - startPosition[0]
                    let height = movePosition[1] - startPosition[1]

                    // if (width<0&&height<0){
                    //     newBlock.style.left = movePosition[0]+ "px"
                    //     newBlock.style.top = 100+ "px"
                    // }
                    // else if (width<0&&height>0){
                    //     newBlock.style.left = 0+ "px"
                    //     newBlock.style.top = 100+ "px"
                    // }
                    // else if (width>0&&height<0){
                    //     newBlock.style.left = 0+ "px"
                    //     newBlock.style.top = 100+ "px"
                    // }
                    // else if (width>0&&height>0){
                    //     newBlock.style.left = 0+ "px"
                    //     newBlock.style.top = 100+ "px"
                    // }
                    if (width<0&&height<0){
                        newBlock.style.left = movePosition[0]+ "px"
                        newBlock.style.top = movePosition[1]+ "px"
                    }
                    else if (width<0&&height>0){
                        newBlock.style.left = movePosition[0]+ "px"
                        newBlock.style.top = startPosition[1]+ "px"
                    }
                    else if (width>0&&height<0){
                        newBlock.style.left = startPosition[0]+ "px"
                        newBlock.style.top = movePosition[1]+ "px"
                    }
                    else if (width>0&&height>0){
                        newBlock.style.left = startPosition[0]+ "px"
                        newBlock.style.top = startPosition[1]+ "px"
                    }

                    newBlock.style.width = Math.abs(width) + "px"
                    newBlock.style.height = Math.abs(height) + "px"
                    newBlock.style.background = "rgba(255, 240, 150, 0.4)"

                    newBlock.dimensionOutput = {
                        "width": newBlock.style.width,
                        "height": newBlock.style.height,
                        "left": newBlock.style.left,
                        "top": newBlock.style.top,
                        "page": pageNumber
                    }


                    // console.log(movePosition);
                }// if dragging
            })// add  mousemove event
        })// then
    });// pdf_doc.getPage
    // tryLine = document.querySelectorAll(".tryLine")[0]
}



// to get the pdf file and show the current Page
PDFJS.getDocument({ url: pdfPath })
     .then(function(pdfObject) {
         __PDF_DOC = pdfObject
         __TOTAL_PAGES = pdfObject.numPages
         __CURRENT_PAGE = 231
         console.log(__TOTAL_PAGES);
         totalPage.innerHTML = pdfObject.numPages
         showPage(__CURRENT_PAGE)
         truePdfNumber.value = __CURRENT_PAGE-20
     }
);




pdfPageInputBox.addEventListener("keydown", function(){
    if (event.keyCode==13){
        console.log(event.target.value);
        canvasContainer.scrollTo(0,0)
        let allCanvas = document.querySelectorAll("canvas")
        let allBottomLines = document.querySelectorAll(".canvasBottomLine")
        allCanvas.forEach(canvas=>canvas.remove())
        allBottomLines.forEach(allBottomLine=>allBottomLine.remove())
        pdfPageInputBox.value = event.target.value
        truePdfNumber.value = parseInt(pdfPageInputBox.value) -20
        showPage(parseInt(event.target.value))

    }

})



let lastPosition;
canvasContainer.addEventListener("scroll", function(){

    let position = event.target.scrollTop
    let scrollDirection


    let counterContainerHeight = document.querySelector(".counterContainer").clientHeight
    let canvasContainer = document.querySelector(".canvasContainer")
    let windowHeightOffSet = window.innerHeight - counterContainerHeight
    let scrollPositionFromTheTop = windowHeightOffSet+position -50

    if (scrollPositionFromTheTop > lastPosition) {
        console.log("scrollDown");
        scrollDirection = "scrollDown"
    } else {
        console.log("scrollUp");
        scrollDirection = "scrollUp"
    }

    lastPosition = scrollPositionFromTheTop
    line.style.top = scrollPositionFromTheTop + 50 + "px"

    // the bottom green line and red line
    let lineHeight = line.clientHeight
    let centerOfLine = scrollPositionFromTheTop + lineHeight/2

    let canvasBottomLines = document.querySelectorAll(".canvasBottomLine")


    canvasBottomLines.forEach(bottomLine=>{
        // console.log(, bottomLine.pageNumber);
        let range = 30
        let overlap
        let change
        // check if overLap

        overlap = Math.round(centerOfLine + range) > Math.round(bottomLine.offsetTop) && Math.round(centerOfLine-range) < Math.round(bottomLine.offsetTop)

        if (scrollDirection=="scrollDown"){
            change = +0
        } else {

            change = -1
        }


        if (overlap){
            pdfPageInputBox.value = bottomLine.pageNumber + change
            truePdfNumber.value = pdfPageInputBox.value-20+1
            if (!bottomLine.triggered){
                console.log(bottomLine.pageNumber, bottomLine.offsetTop, bottomLine.triggered);
                bottomLine.triggered = true
                showPage(bottomLine.pageNumber)
            }
        }// if overlap

    })

    // canvas.forEach((c, i)=>{


    // })// forEach canvas
})


// document.querySelector("textLayer").addEventListener("keydown", function(){
//     if (event.keyCode=="72"&&event.ctrlKey){
//
//         var selection= window.getSelection().getRangeAt(0);
//         var selectedText = selection.extractContents();
//
//         // console.log(selection.startContainer.parentNode);
//         var span = document.createElement("span");
//         span.style.background = "rgba(255,255,224, 1)";
//         span.appendChild(selectedText);
//         let targetDiv = selection.startContainer.parentElement
//         console.log(targetDiv, selectedText);
//         // mayuko = targetDiv.parentNode
//
//         // let targetDivLocation = targetDiv.
//         // targetDiv.parentNode.insertBefore(span, targetDiv)
//
//
//         // selection.insertNode(span);
//
//     }
// })

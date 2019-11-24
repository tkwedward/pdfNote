/*
Functions:
1. link button and create new Cell function
2. declare a class for cell create
3. button addEvent of create the new cell



Cell should have the following properties
Property
1. type: Equation, Image
2. id

Fucntions
1. click to select event
2. move up and move down to next cell
3. pin button
4. copy and paste function

*/

function createNewCell(cellLabel, cellID, loadData={}, cellTitle=false, annotationType="textAnnotation"){
    let cell = document.createElement("div")
    cell.classList.add("cell")
    cell.cellID = cellID

    let cellControlPanel = document.createElement("div")
    cellControlPanel.classList.add("cellControlPanel")
    cell.append(cellControlPanel)
    /*
        add click event
        1. moveUp and moveDown event
        2. delete and create
    */
    cell.addEventListener("click", function(){
        let allCells = document.querySelectorAll(".cell")
        allCells.forEach(p=>p.classList.remove("selectedCell"))
        console.log("I am a cell. I am being selected.")
        cell.classList.add("selectedCell")
    })

    let pinValue = "keep"
    let cellLinkPdfPageButton = "link pdf"


    if (loadData){
        pinValue = loadData["pinValue"]
        cellLabel = loadData["cellLabel"]
        cellTitle = loadData["cellTitle"]

        cellLinkPdfPageButton = loadData["cellLinkPdfPageButton"]
        console.log(loadData);
        cellGoToLinkButton = loadData["goToLinkButton"]
    }
    console.log(loadData);
    console.log(cellLinkPdfPageButton);

    /*
        Add units
        1. pinButton
        2. addAnnotationButton
        3. cellTypeLable
    */
    let pinButton = createButton("pinButton", pinValue, "click", function(){
        event.target.classList.toggle("keep")
        event.target.innerHTML = pinButton.innerHTML=="keep" ? "release": "keep"
    })

    let addTitleButton = createButton("titleButton", "add Title", "click", function(){
        target = event.target.parentNode.parentNode
        let title = document.createElement("h2")
        title.classList.add("cellTitle")
        title.contentEditable = true
        let firstAnnotation = target.querySelector(".annotation")

        title.innerHTML = cellTitle
        console.log(target);
        target.insertBefore(title, firstAnnotation)

        // target.insertBefore(firstAnnotation, title)

    })

    let linkPdfPageButton = createButton("linkPdfPageButton", cellLinkPdfPageButton, "click", function (){
        linkPdfPage(cellGoToLinkButton)
    })

    let changeToSectionButton = createButton("changeToSectionButton", "section", "click", changeToSectionCell)

    let addAnnotationButton = createButton("addAnnotationButton", "add note", "click", function(){
        let annotation = createAnnotation("textAnnotation")
        console.log("i create a new annotation");
        cell.insertBefore(annotation, cellControlPanel)
        cellControlPanel.scrollIntoView()
    })

    let addImageAnnotationButton = createButton("addImageAnnotationButton", "add image", "click", function(){
        let annotation = createAnnotation("imageAnnotation")
        cell.insertBefore(annotation, cellControlPanel)
        cellControlPanel.scrollIntoView()
    })

    let addCameraAnnotationButton = createButton("addCameraAnnotationButton", "add camera image", "click", function(){
        let annotation = createAnnotation("cameraAnnotation")

        cell.insertBefore(annotation, cellControlPanel)
        cellControlPanel.scrollIntoView()
    })

    let cellTypeLabel = createLabel(cellLabel)

    // load data

    console.log(cellTitle);
    if (cellTitle){
        console.log(cellTitle);
        let title = document.createElement("h2")
        title.classList.add("cellTitle")
        title.contentEditable = true
        let firstAnnotation = cell.childNodes[0]
        console.log(cell);

        title.innerHTML = cellTitle
        cell.append(title, firstAnnotation)
    }

    if (!loadData){
        if (cellLabel!="ImageCell"){
            let annotation = createAnnotation(annotationType)
            cell.insertBefore(annotation, cellControlPanel)
            cellControlPanel.scrollIntoView()
        }
    }


        /*
        Buttons, label and notes added to the cell
    */
    let appendList = [pinButton, addAnnotationButton, addImageAnnotationButton, addCameraAnnotationButton, addTitleButton, changeToSectionButton, linkPdfPageButton]
    appendList.forEach(p=>{
        cellControlPanel.append(p)
    })


    return cell
}// createNewCell

/*
    create things in the cell
    1. createButton
    2. createLabel
    3. createAnnotation
*/
function createButton(buttonType, innerHTML, event, eventFunction){
    // create pin button
    let button = document.createElement("button")
    button.classList.add(buttonType)
    button.innerHTML = innerHTML
    button.addEventListener(event, eventFunction)
    return button
}// createButton

function createLabel(name){
    let label = document.createElement("span")
    label.classList.add(name, "cellLabel")
    label.style.background = "yellow"
    label.innerHTML = name
    return label
}// createLabel


function createAnnotation(annotationType){
    let annotation = document.createElement("div")
    annotation.classList.add("annotation", annotationType)
    annotation.annotationType = annotationType
    // annotation.innerHTML = innerHTML
    annotation.contentEditable = true
    if (annotationType=="textAnnotation"){
        annotation.contentEditable = false
        let latexMotherCell = document.createElement("div")
        latexMotherCell.classList.add("latexMotherCell")
        latexMotherCell.contentEditable = true;
        // latexMotherCell.innerHTML = "mother"
        latexMotherCell.style.fontSize = "20px"
        latexMotherCell.style.marginBottom = "20px"
        latexMotherCell.style.border = "2px red solid"

        let latexChildCell = document.createElement("div")
        latexChildCell.classList.add("latexChildCell")
        latexChildCell.contentEditable = false;
        // latexChildCell.innerHTML = "child"

        let questionButton = createButton("questionButton", "question", "click", function(){
            let status = event.target.innerHTML

            event.target.innerHTML = status=="question"? "solved": "question"
            if (status=="question"){
                event.target.parentNode.style.background = "yellow"

            } else {
                event.target.parentNode.style.background = "wheat"
            }
        })// createButton

        if (questionButton.innerHTML == "solved"){
            questionButton.parentNode.style.background = "yellow"
        }

        latexMotherCell.addEventListener("focus", function(){
            let allLatexMotherCell= document.querySelectorAll("latexMotherCell")
            allLatexMotherCell.forEach(p=>p.classList.remove("selected"))
            event.target.classList.add("selected")
            changeMode("Edit")
        })

        latexMotherCell.addEventListener("DOMSubtreeModified", function(){
            let motherInnerText = latexMotherCell.innerHTML

            console.log(motherInnerText, latexMotherCell, latexChildCell);
            renderLatex(latexMotherCell, latexChildCell)
            latexMotherCell.classList.remove("selected")
            // latexMotherCell.style.display = "none"
            changeMode("Command")

        })

        latexMotherCell.addEventListener("blur", function(){
            let innerText = latexMotherCell.innerHTML
            if (!innerText==""){
                event.target.style.display = "none"
            }

        })



        // latexMotherCell.addEventListener("input", function(){
        //
        //
        // })

        latexChildCell.addEventListener("click", function(){
            let latexMotherCell = event.target.previousSibling
            latexMotherCell.style.display = "block"
        })


        annotation.append(latexMotherCell, latexChildCell, questionButton)
        // annotation.append(latexMotherCell, latexChildCell)
    } else if (annotationType=="imageAnnotation") {
        let imageTextButton = createButton("imageTextButton", "add text", "click", function(){
            let imageText = document.createElement("div")
            imageText.contentEditable = true
            imageText.classList.add("imageText")
            imageText.style.background = "MistyRose"
            imageText.innerText = "imageText"
            event.target.parentNode.append(imageText)
        })// createButton
        annotation.append(imageTextButton)

        annotation.addEventListener("focus", function(){
            let allAnnotation = document.querySelectorAll(".annotation")
            allAnnotation.forEach(p=>{
                p.classList.remove("selected")
            })
            changeMode("Edit")
            event.target.classList.add("selected")
        })
        annotation.addEventListener("blur", function(){
            // to render the latex
            changeMode("Command")
            event.target.classList.remove("selected")
        })// annotation.addEventListener("blur",

    }// imageAnnotation
    else if (annotationType=="cameraAnnotation"){
        let uploadImageButton = document.createElement("input")
        uploadImageButton.type = "file"
        uploadImageButton.accept = "image"
        uploadImageButton.classList.add("cameraInputButton")
        annotation.append(uploadImageButton)

        uploadImageButton.addEventListener("input", function(){
            console.log(event.target.files[0]);
            let pdfContainer = document.querySelector(".pdfContainer")
            pdfContainer.style.background="yellow"
            let imageDIV = document.querySelector(".cameraImage")
            if (!imageDIV){
                imageDIV = document.createElement("div")
                imageDIV.classList.add("cameraImage")
                pdfContainer.append(imageDIV)
            }


            let fr = new FileReader()
            fr.onload = function(){

                // let imageAnnotation = createAnnotation("imageAnnotation")
                // console.log();
                console.log(fr.result);
                let image = imageDIV.querySelector("img")
                console.log(image);
                if (!image){
                    image = new Image()
                    imageDIV.append(image)
                }

                image.src = fr.result
                image.style.maxWidth="100%"

                // annotation.parentNode.insertBefore(imageAnnotation, annotation)
                annotation.remove()
            }
            fr.readAsDataURL(event.target.files[0]);







        })
    }// cameraAnnotation
    let deleteButton = createButton("deleteButton", "delete", "click", function(){
        let target = event.target.parentNode.remove()
    })// deleteButton

    let insertAbove = createButton("insertAbove", "insertAbove", "click", function(){
        let newAnnotation = createAnnotation("textAnnotation")
        let targetAnnotation = event.target.parentNode
        let parentNode = targetAnnotation.parentNode
        parentNode.insertBefore(newAnnotation, targetAnnotation)
    })// insertAbove

    let insertBelow = createButton("insertBelow", "insertBelow", "click", function(){
        let newAnnotation = createAnnotation("textAnnotation")
        let targetAnnotation = event.target.parentNode
        let parentNode = targetAnnotation.parentNode

        parentNode.insertBefore(newAnnotation, targetAnnotation)
        parentNode.insertBefore(targetAnnotation, newAnnotation)
    })// insertBelow

    let usefulButton = createButton("useful", "usefulButton", "click", function(){
        let _usefulCellData = {}
        let button = event.target
        let _annotation = event.target.parentNode
        let _cell = event.target.parentNode.parentNode
        let _cellTitle = _cell.querySelector(".cellTitle").innerHTML
        _usefulCellData["title"]=title
        _usefulCellData["chapter"]=chapter
        _usefulCellData["cellTitle"]=_cellTitle
        button.classList.toggle("addToUseful")

        _annotation.addToUsefulEquation = _annotation.addToUsefulEquation==true?false:true
        console.log(_annotation.addToUsefulEquation);

        if (_annotation.classList.contains("imageAnnotation")){
            console.log(_annotation, _cellTitle);
            let _annotationData = {}
            let imgSrc = _annotation.querySelector("img").src
            _annotationData["imgSrc"] = imgSrc
            _annotationData["imgFileName"] = _annotation.querySelector(".fileNameInput").value
            _annotationData["imageText"] = _annotation.querySelector(".imageText").innerHTML
            _usefulCellData["annotationData"] = _annotationData
            console.log(_usefulCellData, _annotationData);

            ajaxSendJson(url, _usefulCellData, "addToUseful", "success add to important", function(){
                console.log(url);
            })
        }

        // let newAnnotation = createAnnotation("textAnnotation")
        // let targetAnnotation = event.target.parentNode
        // let parentNode = targetAnnotation.parentNode
        //
        // parentNode.insertBefore(newAnnotation, targetAnnotation)
        // parentNode.insertBefore(targetAnnotation, newAnnotation)
    })// insertBelow

    annotation.append(deleteButton, insertAbove, insertBelow, usefulButton)

    return annotation
}// createAnnotation

function renderLatex(latexMotherCell, latexChildCell){
    let input = latexMotherCell.innerHTML
    let inputEscapeFiltered = input.split("@")
    if (input.length!=0){
        inputEscapeFiltered = inputEscapeFiltered.join("\\")
        let inputMoneySignFiltered = inputEscapeFiltered.split("##")
        if (inputMoneySignFiltered.length!=0){
            result = inputMoneySignFiltered.join("$$")
            latexChildCell.innerHTML = result;
        } else {
            latexChildCell.innerHTML = inputEscapeFiltered;
        }
    } else {
        let inputMoneySignFiltered = input.split("##")
        if (inputMoneySignFiltered.length!=0){
            result = inputMoneySignFiltered.join("$$")
            latexChildCell.innerHTML = result;
        } else {
            output.innerHTML = input;
        }
    }// input.length!=0

    MathJax.texReset()
    MathJax.typesetClear();
    MathJax.typesetPromise()
        .then(function(){
            latexChildCell.style.fontSize = "20px"
        })
}// renderLatex

function changeToSectionCell(){
    let target = event.target
    let annotation = target.parentNode.querySelector(".annotation")
    annotation.remove()
    annotation.style.fontSize = "80px";
    target.parentNode.querySelector(".titleButton").click()
}

function linkPdfPage(cellGoToLinkButton){
    console.log(cellGoToLinkButton);
    let targetPDF = document.querySelector(".pdfSelect").value
    let iframe = document.getElementById("pdfIframe").contentDocument
    let targetPageEle = iframe.querySelector("#pageNumber")
    let targetPage = targetPageEle.value
    event.target.innerHTML = "link PDF, page "+targetPage
    event.target.setAttribute("data-pdf", targetPDF)
    event.target.setAttribute("data-page", targetPage)

    let goToButton = event.target.querySelector("goToLinkButton")
    console.log(goToButton===null);
    if (goToButton===null  ){
        goToButton = createButton("goToLinkButton", "page "+targetPage, "click", function(){
            let iframe = document.getElementById("pdfIframe").contentDocument
            let targetPageEle = iframe.querySelector("#pageNumber")
            let targetPage = event.target.innerHTML.split(" ")[1]
            targetPageEle.value = targetPage
        })
    } else {
        console.log(targetPageEle);
        goToButton.innerHTML = "page "+targetPage
    }

    event.target.parentNode.append(goToButton)
}

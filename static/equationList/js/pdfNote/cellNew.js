function changeMode(newMode){
    mode = newMode
    document.querySelector(".mode").innerHTML = newMode
}
// createNewCell
function createNewCell(){
    let cell = document.createElement("div")
    cell.classList.add("cell")

    cell.cellID = cellID || 0
    cellID+=1


    let cellTitle = document.createElement("h2")
    cellTitle.classList.add("cellTitle")
    cellTitle.contentEditable = true
    cellTitle.innerHTML = ""
    cellTitle.sectionTitle = "false"
    cell.append(cellTitle)

    let cellControlPanel = document.createElement("div")
    cellControlPanel.classList.add("cellControlPanel")

    // add elements
    // cellTitle, firstAnnotation, cellControlPanel
    cell.append(cellControlPanel)


    // events
    cell.addEventListener("click", function(){
        let allCells = document.querySelectorAll(".cell")
        allCells.forEach(p=>p.classList.remove("selectedCell"))
        console.log("I am a cell. I am being selected.")
        cell.classList.add("selectedCell")
    })

    cell.addEventListener("keydown", function(){
        console.log("copy cell");
        if (event.keyCode==82 && event.ctrlKey){// to insert cell
            let targetCell = event.target.parentNode.innerHTML


            let copyCell = document.createElement("div")
            copyCell.classList.add("copyCell")
            copyCell.innerHTML = targetCell


            let copyNoteContainer = document.querySelector(".copyNoteContainer")
            copyNoteContainer.innerHTML = ""
            copyNoteContainer.style.display = "block"
            copyNoteContainer.append(copyCell)

            let noteCardContainer = document.querySelector(".noteCardContainer")
            noteCardContainer.style.display= "none"

            copyNoteContainer.scrollTo(0, 0)
        }
    })


    let pinButton = createButton("pinButton", function(){
        pinButton.innerHTML = pinButton.innerHTML=="keep"? "release": "keep"
    })
    pinButton.innerHTML = "keep"



    let addAnnotationButton = createButton("addAnnotationButton", function(){
        let newAnnotation = createAnnotation("textAnnotation")
        cell.insertBefore(newAnnotation, event.target.parentNode)
    })
    addAnnotationButton.innerHTML = "addAnnotation"



    let sectionTitleButton = createButton("sectionTitleButton", function(){
        let targetCell = event.target.parentNode.parentNode
        targetCell.sectionTitle = targetCell.sectionTitle=="false"? "true": "false"

        if (targetCell.sectionTitle=="true"){
            targetCell.classList.add("sectionTitle")
        } else {
            targetCell.classList.remove("sectionTitle")
        }


        setSectionColor()
    })
    sectionTitleButton.innerHTML = "section"


    cellControlPanel.append(pinButton, addAnnotationButton, sectionTitleButton)

    cell.initiate = function(){
        let firstAnnotation = createAnnotation("textAnnotation")
        cell.append(firstAnnotation)
    }

    cell.save = function(){
        saveObject = {
            cellID: cell.cellID,
            cellTitle: cellTitle.innerHTML,
            sectionTitle: cell.sectionTitle,
            pinButton: pinButton.innerHTML,

            annotation: []
        }

        let annotations = cell.querySelectorAll(".annotation")
        let goToPageButton = cell.querySelector(".goToPageButton")
        if (goToPageButton){
            saveObject["goToPageButton"] = goToPageButton.innerHTML
        }

        annotations.forEach(p=>{
            saveObject["annotation"].push(p.save())
        })

        return saveObject
    }

    cell.load = function(loadData){
        if (loadData["cellID"]){
            cell.cellID = loadData["cellID"]
            cellID -= 1
            cell.append("cellID is " + cell.cellID)
        }

        // pinButton: keep / release
        let pinButton = cell.querySelector(".pinButton")
        pinButton.innerHTML = loadData["pinButton"]

        // sectionTitle = true / false
        cell.sectionTitle = loadData["sectionTitle"]

        if (cell.sectionTitle=="true"){
            cell.classList.add("sectionTitle")
        }

        // cellTitle
        cellTitle.innerHTML = loadData["cellTitle"] ||""
        loadData.annotation.forEach(p=>{
            let newAnnotation = createAnnotation(p.annotationType, p)

            newAnnotation.load(p)
            cell.insertBefore(newAnnotation, cellControlPanel)
        })





    }
    return cell
}


// createButton
function createButton(buttonType, eventFunction, loadData={}){
    let button = document.createElement("button")
    button.classList.add(buttonType)
    button.addEventListener("click", eventFunction)
    return button
}

// createAnnotation
function createAnnotation(annotationType){
    let currentAnnotation
    let annotation = document.createElement("div")
    let type = annotationType || "textAnnotation"
    annotation.classList.add(type, "annotation")
    annotation.style.marginBottom = "20px"
    annotation.annotationType = annotationType
    annotation.id = annotationID
    annotationID+=1
    annotationLabel.innerHTML = annotationID
    // annotation.style.background = "wheat"

    let annotationContent = document.createElement("div")
    annotationContent.classList.add("annotationContent")

    // annotationControlPanel
    let annotationControlPanel = document.createElement("div")
    annotationControlPanel.classList.add("annotationControlPanel")

    let questionButton = createButton("questionButton", function(){
        let status = event.target.innerHTML
        event.target.innerHTML = status=="question"? "solved": "question"
        if (status=="question"){
            event.target.parentNode.previousSibling.style.background = "yellow"
        } else {
            event.target.parentNode.previousSibling.style.background = "wheat"
        }
    })
    questionButton.innerHTML = "question"

    let deleteButton = createButton("deleteButton", ()=>{
        event.target.parentNode.parentNode.remove()
    })
    deleteButton.innerHTML = "delete"

    let insertAbove = createButton("insertAbove", function(){
        let newAnnotation = createAnnotation("textAnnotation")
        let targetAnnotation = event.target.parentNode.parentNode
        let parentNode = targetAnnotation.parentNode
        parentNode.insertBefore(newAnnotation, targetAnnotation)
    })
    insertAbove.innerHTML = "insertAbove"

    let insertBelow = createButton("insertBelow", function(){
        let newAnnotation = createAnnotation("textAnnotation")
        let targetAnnotation = event.target.parentNode.parentNode
        let parentNode = targetAnnotation.parentNode
        parentNode.insertBefore(newAnnotation, targetAnnotation)
        parentNode.insertBefore(targetAnnotation, newAnnotation)
    })
    insertBelow.innerHTML = "insertBelow"

    let addToQuestionBankButton = createButton("addToQuestionBankButton", function (){
        let _annotation = event.target.parentNode.parentNode
        let _cell = _annotation.parentNode

        // get cell Data and filter out the annotation
        let _cellData = _cell.save()
        let _annotationData = _annotation.save()
        _cellData["annotation"] =  _cellData["annotation"].filter(p=> p["annotationID"]==_annotationData["annotationID"]);


        let noteData = createBaseSaveData()
        noteData["cells"].push(_cellData)

        ajaxSendJson(url, noteData, "addToQuestionBank", "success", function (data){
            console.log(data);
        })

    })
    addToQuestionBankButton.innerHTML = "Question Bank"

    let mergeButton = createButton("mergeButton", function (){

    })


    let linkPdfPageButton = createButton("linkPdfPageButton", function(){
        let pageNumber = document.querySelector("#pdf-page")
        linkPdfPageButton.pageNumber = pageNumber.value
        if (event.target.innerHTML == "unlink"){
            console.log("I want to unlink");
            let goToPageButton = event.target.parentNode.querySelector(".goToPageButton")
            console.log(goToPageButton);
            goToPageButton.remove()
        } else{
            let bookmark = createButton("goToPageButton", function(){

                let keyboardEvent = new Event("keydown")
                keyboardEvent.keyCode = 13
                pageNumber.value = bookmark.innerHTML.split(". ")[1]
                pageNumber.dispatchEvent(keyboardEvent)
                // pageNumber.value = 10
            })
            bookmark.innerHTML = "go to P. "+ pageNumber.value
            event.target.parentNode.append(bookmark)

        }

        linkPdfPageButton.innerHTML = linkPdfPageButton.innerHTML=="link PDF"? "unlink": "link PDF"




    })
    linkPdfPageButton.innerHTML = "link PDF"

    annotationControlPanel.append(questionButton, deleteButton, insertAbove, insertBelow, addToQuestionBankButton)


    // latexMotherCell, latexChildCell
    if (annotationType=="textAnnotation"){
        annotationContent = textAnnotationContent(annotationContent)
        annotation.append(annotationContent)
    } else if (annotationType=="imageAnnotation"){

        let [imageTextButton, usefulButton] = [...imageAnnotationContent(annotationContent)]
        annotationControlPanel.append(imageTextButton, usefulButton)
    }// imageAnnotation

    annotationControlPanel.append(linkPdfPageButton)
    annotation.append(annotationContent, annotationControlPanel)

    annotation.save = function(){
        let attributes = ["annotationType", "latexMotherCell"]

        let saveObject;


        if (annotationType=="textAnnotation"){
            let latexMotherCell = annotation.querySelector(".latexMotherCell")
            let questionButton = annotation.querySelector(".questionButton")

            saveObject = {
                questionStatus: questionButton.innerHTML,
                latexMotherCell: latexMotherCell.innerHTML
            }

        } else if (annotationType=="imageAnnotation"){
            saveObject = {
                imageText: [],
                src: "",
                createDate: "",
                fileName: "",
            }

            let imageTextAll = annotationContent.querySelectorAll(".imageText")
            imageTextAll.forEach(p=>{
                saveObject["imageText"].push(p.innerHTML)
            })


            let image = annotation.querySelector("img")
            saveObject.src = image.src
            saveObject.createDate = image.createDate

            saveImageAndGetURL(annotation)

            let fileName = annotation.querySelector(".fileNameInput").value
            saveObject["fileName"] = fileName

            let usefulButton = annotationControlPanel.querySelector(".usefulButton")
            if (usefulButton){
                saveObject["usefulButton"]= usefulButton.innerHTML
            }

        }
        saveObject["annotationType"] = annotation.annotationType
        saveObject["annotationID"] = annotation.id
        saveObject["pageNumber"] = linkPdfPageButton.pageNumber
        console.log(saveObject["pageNumber"]);
        return saveObject
    }// save function

    annotation.load = function(data){
        // to create the id
        if (data["annotationID"]){
            annotation.id = data["annotationID"]
            annotationID -= 1
            annotationLabel.innerHTML = annotationID
            annotation.append(annotation.id)
        }


        console.log(data["pageNumber"]);
        if (data["pageNumber"]){
            linkPdfPageButton.pageNumber = data["pageNumber"]
            linkPdfPageButton.innerHTML = "unlink"
            let pageNumber = document.querySelector("#pdf-page")


            let bookmark = createButton("goToPageButton", function(){
                let keyboardEvent = new Event("keydown")
                keyboardEvent.keyCode = 13
                pageNumber.value = bookmark.innerHTML.split(". ")[1]
                pageNumber.dispatchEvent(keyboardEvent)
            })
            bookmark.innerHTML = "go to P. "+ data["pageNumber"]
            annotationControlPanel.append(bookmark)
        }





        if (annotationType=="textAnnotation"){

            let latexMotherCell = annotation.querySelector(".latexMotherCell")

            let questionButton = annotation.querySelector(".questionButton")

            questionButton.innerHTML = data["questionStatus"]
            if (data["questionStatus"]=="solved"){
                annotationContent.style.background = "yellow"
            }

            latexMotherCell.innerHTML = data["latexMotherCell"]||data["innerHTML"]||"_"
            latexMotherCell.style.display = "none";
        } else if (annotationType=="imageAnnotation"){
            let image = annotationContent.querySelector("img")
            let fileNameInput = annotationContent.querySelector(".fileNameInput")


            let imageTextGroup = data["imageText"]
            if (typeof imageTextGroup == "string"){
                let imageText = createImageText(imageTextGroup)
                annotationContent.append(imageText)
            } else {
                if (imageTextGroup){
                    imageTextGroup.forEach(txt=>{
                        let imageText = createImageText(txt)
                        annotationContent.append(imageText)
                    })
                }

            }

            image = annotationContent.querySelector("img")
            image.src = data.src
            fileNameInput.value = data.fileName
            // annotationContent.append(image)

            // image.src = data.src
        }

    }

    return annotation
}



function createImageText(loadData=false){
    let imageText = document.createElement("div")
    imageText.contentEditable = true
    imageText.classList.add("imageText")
    imageText.style.background = "MistyRose"
    imageText.innerHTML = loadData||"imageText"
    return imageText
}

// let firstCell = createNewCell()
// document.querySelector(".noteContainer").append(firstCell)



function imageAnnotationContent(annotationContent, loadData={}){
    let image = new Image()
    image.src = ""
    let fileNameInput = document.createElement("input")
    fileNameInput.classList.add("fileNameInput")
    annotationContent.append(image, fileNameInput)

    let imageTextButton = createButton("imageTextButton", function(){
        let imageText = document.createElement("div")
        imageText.contentEditable = true
        imageText.classList.add("imageText")
        imageText.style.background = "MistyRose"
        imageText.innerHTML = "imageText"
        annotationContent.append(imageText)
    })
    imageTextButton.innerHTML = "add text"

    let usefulButton = createButton("useful", function(){
        let _usefulCellData = {}
        let button = event.target
        let _annotation = event.target.parentNode.parentNode
        let _cell = event.target.parentNode.parentNode
        let _cellTitle = _cell.querySelector(".cellTitle").innerHTML
        _usefulCellData["title"]=title
        _usefulCellData["chapter"]=chapter
        _usefulCellData["cellTitle"]=_cellTitle
        button.classList.toggle("addToUseful")

        _annotation.addToUsefulEquation = _annotation.addToUsefulEquation==true?false:true

        if (_annotation.classList.contains("imageAnnotation")){
            let _annotationData = {}
            let imgSrc = _annotation.querySelector("img").src
            _annotationData["imgSrc"] = imgSrc
            _annotationData["imgFileName"] = _annotation.querySelector(".fileNameInput").value
            _annotationData["imageText"] = _annotation.querySelector(".imageText").innerHTML
            _usefulCellData["annotationData"] = _annotationData

            ajaxSendJson(url, _usefulCellData, "addToUseful", "success add to important", function(){
                console.log(url);
            })
        }
    })
    usefulButton.innerHTML = loadData["usefulButton"] || "useful"
    return [imageTextButton, usefulButton]
}

function textAnnotationContent(annotationContent, loadData={}){
    let latexMotherCell = document.createElement("div")
    latexMotherCell.classList.add("latexMotherCell")
    latexMotherCell.contentEditable = true;
    latexMotherCell.style.minHeight = "40px"
    latexMotherCell.style.fontSize = "20px"
    latexMotherCell.style.border = "2px green solid"
    latexMotherCell.innerHTML = loadData["latexMotherCell"] || ""

    let latexChildCell = document.createElement("div")
    latexChildCell.classList.add("latexChildCell")
    latexChildCell.contentEditable = false;
    latexChildCell.innerHTML = loadData["latexMotherCell"] || ""

    latexMotherCell.addEventListener("focus", function(){
        let allLatexMotherCell= document.querySelectorAll("latexMotherCell")
        allLatexMotherCell.forEach(p=>p.classList.remove("selected"))
        event.target.classList.add("selected")
        changeMode("Edit")
    })

    latexMotherCell.addEventListener("DOMSubtreeModified", function(){
        let motherInnerText = latexMotherCell.innerHTML
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

    latexMotherCell.addEventListener("click", function(){
        let allMother = document.querySelectorAll(".latexMotherCell")
        let blurEvent = new Event("blur")
        allMother.forEach(mother=>{
            if (mother!=event.target){
                mother.classList.remove("selected")
                // mother.dispatchEvent(blurEvent)
            }
        })
        event.target.classList.add("selected")
    })

    latexChildCell.addEventListener("click", function(){
        let latexMotherCell = event.target.previousSibling
        latexMotherCell.style.display = "block"
    })
    annotationContent.append(latexMotherCell, latexChildCell)

    return annotationContent
}

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

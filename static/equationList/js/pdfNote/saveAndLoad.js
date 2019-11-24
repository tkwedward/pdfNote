let saveButton = document.querySelector(".saveButton")
saveButton.addEventListener("click", function(){
    console.log("save success");
    saveNote()
})

let title = document.querySelector(".noteTitle").innerHTML
let chapter = document.querySelector(".noteChapter").innerHTML
// saveButton.click()


/*
    Flow:
    saveNote => get cell Data => get annotation data

    1. saveNote:
    - to save the note

    2. updateNoteData:
    - to update the note data

    3. extractDataFromAnnotation:
    - to extract the data from annotations
*/

function saveNote(){
    let allCells = document.querySelectorAll(".cell")
    let title = document.querySelector(".noteTitle").innerHTML
    let chapter = document.querySelector(".noteChapter").innerHTML
    let counter = document.querySelectorAll(".counter")



    checkURL()

    let noteData = {
        "title": title,
        "chapter": chapter,
        "cells": [],
        "counter": {},
        "pdfList": ""
    }

    let pdfFileList = document.querySelector(".pdfSelect")
    noteData["pdfFileList"] = pdfFileList.innerHTML

    let pdfImage = document.querySelector(".pdfContainer img")

    if (pdfImage){
        noteData["pdfImage"] = pdfImage.outerHTML
        console.log(noteData);
    }

    counter.forEach(p=>{
        let counterClassList = p.classList
        let count = p.querySelector("span").innerHTML
        if (counterClassList.contains("equationCounter")){
            noteData.counter["equationCounter"] = count
        }
        else if (counterClassList.contains("exampleCounter")){
            noteData.counter["exampleCounter"] = count
        }
        else if (counterClassList.contains("solutionCounter")){
            noteData.counter["solutionCounter"] = count
        }
        else if (counterClassList.contains("figureCounter")){
            noteData.counter["figureCounter"] = count
        }
        else if (counterClassList.contains("tableCounter")){
            noteData.counter["tableCounter"] = count
        }
        else if (counterClassList.contains("theoremCounter")){
            noteData.counter["theoremCounter"] = count
        }
        else if (counterClassList.contains("proofCounter")){
            noteData.counter["proofCounter"] = count
        }
    })

    allCells.forEach(cell=>{
        let cellData = {
            "annotation":[],
        };
        cell.childNodes.forEach(ele=>{
            // console.log(ele);
            // console.log("********************");
            cellData = updateNoteData(ele, cellData)
        })// loop cell element of a cell
        noteData["cells"].push(cellData)

    })// loop allCells
    console.log("before sent ajax");
    console.log(noteData);
    ajaxSendJson(url, noteData, "save state", "success to save", function(){
        console.log("after sent ajax");
        console.log(noteData);
    })
     console.log("I stop sending the request to python");
} // saveNote


// cell Data = each cell
// ele = ele inside a cell
function updateNoteData(ele, cellData){
    let classList = ele.classList
    let pinButton = ele.querySelector(".pinButton")
    let linkPdfPageButton = ele.querySelector(".linkPdfPageButton")
    let goToLinkButton = ele.querySelector(".goToLinkButton")
    // console.log(cellControlPanel)

    if (classList.contains("cellTitle")){
        cellData["cellTitle"] = ele.innerHTML
    }

    else if (classList.contains("cellControlPanel")){
        let cellControlPanelChild = ele.childNodes
        console.log(cellControlPanelChild);
        cellControlPanelChild.forEach(child=>{
            console.log(child.innerHTML);
            if (child.classList.contains("pinButton")){
                cellData["pinButton"] = child.innerHTML
                cellData["pinButton"] = "save"
                // console.log("pinButton");
            }// pinButton
            else if (child.classList.contains("cellLabel")){
                cellData["cellLabel"] = child.innerHTML
            } // cellLabel
            else if (child.classList.contains("linkPdfPageButton")){
                console.log( ele.innerHTML);
                cellData["linkPdfPageButton"] = child.innerHTML
            }// linkPdfPageButton
            else if (child.classList.contains("goToLinkButton")){
                cellData["goToLinkButton"] = child.innerHTML
            }// goToLinkButton
        })// forEach cellControlPanel child
    }// to save the cellControlPanel

    // else if (classList.contains(""))

    else if (classList.contains("annotation")){
        let annotationData = {}
        let annotation = ele

        if (annotation.classList.contains("textAnnotation")){
            let latexMotherCell = annotation.querySelector(".latexMotherCell")
            console.log("her is the mother cell cotent*******");
            let questionButton = annotation.querySelector(".questionButton")


            if (latexMotherCell){
                annotationData["innerHTML"] = latexMotherCell.innerHTML
            } else {
                annotationData["innerHTML"] = annotation.innerHTML
            }
            annotationData["annotationType"] = "textAnnotation"
            annotationData["questionStatus"] = questionButton.innerHTML
            console.log(annotationData);
        }// if it is textAnnotation
        else if (annotation.classList.contains("imageAnnotation")){
            let image = annotation.querySelector("img")
            let fileName = annotation.querySelector("input").value
            console.log(fileName);
            let imageText = annotation.querySelector(".imageText")
            if (imageText){
                annotationData["imageText"] = imageText.innerHTML
            }
            console.log(annotation.querySelector(".imageText"));

            if (image){
                 annotationData["useful"] = annotation.addToUsefulEquation
                 annotationData["annotationType"] = "imageAnnotation"
                 annotationData["src"] = image.src
                 annotationData["createDate"] = image.createDate
                 annotationData["fileName"] = fileName

            } // if image present
        }// if it is imageAnnotation
        else if (annotation.classList.contains("cameraAnnotation")){
            console.log("**********149 i have cameraAnnotation");
            annotationData["annotationType"] = "cameraAnnotation"
            annotationData["innerHTML"] = annotation.innerHTML
            console.log(annotationData)
        }
        cellData["annotation"].push(annotationData)

    }// if contains annotation

    return cellData
}// updateNoteData

/*
    saveImageAndGetURL
*/

 function saveImageAndGetURL(annotation, cellData){
    let title = document.querySelector(".noteTitle").innerHTML
    let chapter = document.querySelector(".noteChapter").innerHTML
    let fileName = annotation.querySelector(".fileNameInput").value
    let image = annotation.querySelector("img")

    let jsonData =  {"data": image.src, "fileName": fileName, "title": title, "chapter": chapter}

    // send ajaxSendJson to server to get the reduced imagePath
    result = ajaxSendJson(url, jsonData, "save image", "success save image",  async function(imagePath){
        let annotationData = {}
        annotationData["annotationType"] = "imageAnnotation"
        annotationData["fileName"] = fileName
        annotationData["src"] = imagePath.src
        annotationData["createDate"] = image.createDate
        cellData["annotation"].push(annotationData)
        console.log("The ajax get the imagePath");
        console.log(cellData);
        return cellData
    })
    console.log("I will run after the ajaxsent");
    return cellData
}

function checkURL(){
    let noteURL = document.URL.split("/")
    let noteURLTitle = noteURL[noteURL.length-2]
    let noteURLChapter = noteURL[noteURL.length-1]
    if (noteURLTitle!=title && noteURLChapter!=chapter){
        let basePath = "http://127.0.0.1:8000/equation/pdfNote/"
        window.location.href = basePath + title + "/" + chapter
    }
}
/*
    load data
    1. get the data
    2. loop the data
    3. if
*/

function loadDataRequest(title="Title", chapter = "Chapter"){
    title = document.querySelector(".noteTitle").innerHTML
    chapter = document.querySelector(".noteChapter").innerHTML
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-CSRFToken", csrf_token);
    xhr.onreadystatechange =  function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let result = JSON.parse(xhr.response);
            console.log(result);
            fromLoadCreatePage(result);
        }
    }// xhr setRequest
    // console.log(chapter);
    xhr.send(JSON.stringify({"title": title, "chapter":chapter, "todo": "load state"}));
}

function fromLoadCreatePage(jsonResult){
    let title = jsonResult["title"]
    let chapter = jsonResult["chapter"]
    let cells = jsonResult["cells"]
    let counter = jsonResult["counter"]
    let pdfFileList = jsonResult["pdfFileList"]


    let pdfSelect = document.querySelector(".pdfSelect")
    pdfSelect.innerHTML = pdfFileList
    // to put the pdf image to the right and load the image
    let pdfImageContainer = document.querySelector(".pdfImageContainer")
    let placeHolder = document.createElement("div")
    placeHolder.innerHTML = jsonResult["pdfImage"]
    let pdfImage = placeHolder.querySelector("img")
    pdfImageContainer.append(pdfImage)



    if (counter){
        Object.entries(counter).forEach(p=>{
            let key = p[0]
            let value = p[1]
            let counterType = document.querySelector("."+key)
            let count = counterType.querySelector("span")
            count.innerHTML = value
        })
    }


    cells.forEach(cell=>{
        console.log(cell);
        let loadData = {
            "pinValue": cell.pinButton,
            "cellLabel": cell.cellLabel,
            "cellTitle": cell.cellTitle,
            "cellLinkPdfPageButton": cell.linkPdfPageButton
        }
        console.log(cell);

        let loadCell = createNewCell("Image", id, loadData)
        cell.annotation.forEach(item=>{
            console.log(item.annotationType);
            let annotation = createAnnotation(item.annotationType)

            console.log(annotation);
            if (item.annotationType == "textAnnotation"){
                let latexMotherCell = annotation.querySelector(".latexMotherCell")
                let latexChildCell = annotation.querySelector(".latexChildCell")



                if (latexMotherCell){
                    latexMotherCell.innerHTML = item.innerHTML

                } else {
                    annotation.innerHTML = item.innerHTML
                }

                let questionButton = annotation.querySelector(".questionButton")
                questionButton.innerHTML = item.questionStatus
                if (questionButton.innerHTML == "solved"){
                    annotation.style.background = "yellow"
                    annotation.classList.add("question")
                }
            }
            else if (item.annotationType == "imageAnnotation"){
                console.log(annotation);
                let image = new Image()
                let input = document.createElement("input")
                input.classList.add("fileNameInput")
                annotation.append(image, input)


                image.src = item.src
                input.type="text"
                input.value = item.fileName

                if (item.useful==true){
                    annotation.querySelector(".useful").classList.add("addToUseful")
                }

                if (item.imageText){
                    let imageText = document.createElement("div")
                    imageText.contentEditable = true
                    imageText.classList.add("imageText")
                    imageText.innerHTML = item.imageText
                    annotation.append(imageText)
                }

            }// imageAnnotation
            else if (item.annotationType == "cameraAnnotation"){
                let annotation = createAnnotation("cameraAnnotation")
            }// cameraAnnotation
            let cellControlPanel = loadCell.querySelector(".cellControlPanel")
            loadCell.insertBefore(annotation, cellControlPanel)
        })
        noteContainer.append(loadCell)
    })

    let latexMotherCells = document.querySelectorAll(".latexMotherCell")
    latexMotherCells.forEach(mother=>{
        let child  = mother.nextSibling
        console.log(mother);
        mother.style.display = "none"
        renderLatex(mother, child)
    })


    if( isMobile.any()){

    }

}

loadDataRequest(title, chapter)

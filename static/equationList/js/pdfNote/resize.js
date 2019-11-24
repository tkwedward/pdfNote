/*
1. resize the width of pdf and note

2. add pdf to the select menu
pdfFileNameSubmit

3. pdfSelect
- change the src of iframe to import pdf

4. search function
*/


let resizeWidthInput = document.querySelector(".resizeWidth")
resizeWidthInput.addEventListener("click", function(){
    console.log("blur");
    let value = 40
    let noteContainer = document.querySelector(".noteContainer")
    let iframe = document.querySelector("iframe")

    noteContainer.style.width = value + "vw"
    iframe.style.left = value + "vw"
    iframe.style.width = 100-parseInt(value) + "vw"
})

let pdfFileNameSubmit = document.querySelector(".pdfFileNameSubmit")

pdfFileNameSubmit.addEventListener("click", function(){
    let pdfFileNameSubmit = document.querySelector(".pdfFileNameInput")
    let pdfSelect = document.querySelector(".pdfSelect")
    let pdfSelectOption = document.createElement("option")
    pdfSelectOption.value = staticPath + "/" + docTitle + "/" + pdfFileNameSubmit.value
    pdfSelectOption.innerHTML = pdfFileNameSubmit.value

    pdfSelect.append(pdfSelectOption)
})



let showQuestionButton =  document.querySelector(".showQuestionButton")
showQuestionButton.addEventListener("click", function(){

    if (event.target.innerHTML=="show Questions"){
        console.log(event.target);
        let allCells = document.querySelectorAll(".cell")
        allCells.forEach(p=>{
            p.style.display = "none"
        })

        allCells.forEach(p=>{
            let allAnnotation =  p.querySelectorAll(".annotation")
            allAnnotation.forEach(q=>{
                let questionButton = q.querySelector(".questionButton")
                if (questionButton){
                    console.log(questionButton);
                    if  (questionButton.innerHTML!="solved"){
                        q.style.display = "none"
                    }
                    else{
                        p.style.display = "block"
                    }
                } else{
                    q.style.display = "none"
                }
            })


        })
    }// want to show Questions
    else
    {
        let allCells = document.querySelectorAll(".cell")
        allCells.forEach(p=>{
            p.style.display = "block"
            let allAnnotation =  p.querySelectorAll(".annotation")
            allAnnotation.forEach(q=>{
                q.style.display =  "block"
            })
        })
    }
    event.target.innerHTML = event.target.innerHTML=="show Questions"?"restore":"show Questions"
})

let searchInput = document.querySelector(".searchInput")
searchInput.addEventListener("keyup", function(){
    let searchItem = event.target.value.toLowerCase().split(", ")
    let allCells = document.querySelectorAll(".cell")

    if (searchItem.length==0){
        allCells.forEach(p=>{
            p.style.display=="block"
            let allAnnotation = document.querySelectorAll(".annotation")
            allAnnotation.forEach(q=>q.style.display = "block")
        })
    } else {
        allCells.forEach(p=>{
            p.style.display="none"
            let allAnnotation = document.querySelectorAll(".annotation")
            allAnnotation.forEach(q=>{
                q.style.display = "none"
            })
        })

        allCells.forEach(cell=>{
            let allAnnotation = cell.querySelectorAll(".annotation")
            let cell_image_filter = [];
            let cell_imagetext_filter = [];
            let cell_fileName_filter = [];
            console.log(allAnnotation);
            if (allAnnotation.length==0){
                cell.style.display = "none"
            }
            allAnnotation.forEach(annotation=>{
                searchItem.forEach(r=>{

                    // use image name to search
                    let img = annotation.querySelector("img")


                    if (img){
                        let imgName = img.src.toLowerCase().split("/")
                        console.log(imgName[imgName.length-1], imgName[imgName.length-1].search(r));
                        if (imgName[imgName.length-1].search(r)!=-1){
                            cell_image_filter.push(true)
                            annotation.style.display = "block"
                        } // if we cannot find an image
                    }// if img exist
                    else{
                        cell_image_filter.push(false)

                    }
                    // use file Name to search
                    let fileNameInput = annotation.querySelector("input")
                    if (fileNameInput){
                        let fileName = fileNameInput.innerHTML
                        if (fileName.search(r)!=-1){
                            cell_fileName_filter.push(true)
                            annotation.style.display = "block"
                        }
                    }
                    else{
                        cell_fileName_filter.push(false)
                    }

                    // use imagetext to search search
                    let imageAnnotation = annotation.querySelectorAll(".imageText")
                    console.log(imageAnnotation);
                    imageAnnotation.forEach(text=>{
                        if (text){
                            if (text.innerHTML.toLowerCase().search(r)!=-1){
                                cell_imagetext_filter.push(true)
                                annotation.style.display = "block"
                                text.style.display = "block"

                            }
                            else
                            {
                                cell_imagetext_filter.push(false)
                            }
                        }// if text
                    })// forEach imageAnnotaiton

                })// forEach searchItem
            }) // forEach annotaiton
            console.log(cell_image_filter, cell_imagetext_filter);
            if (cell_image_filter.some(p=>p==true)||cell_imagetext_filter.some(p=>p==true)||cell_fileName_filter.some(p=>p==true)){
                cell.style.display = "block"
            }

        })// forEach cell
    } // if the length of the search item is not 0

})// search addEventListener

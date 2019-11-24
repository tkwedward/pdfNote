
import glob, json, os, natsort
from django.conf import settings
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from PIL import Image
from collections import defaultdict
import base64
from io import BytesIO

content = [
    {
        "name": "Townsend",
        "chapter":[2]
    },
    {
        "name": "An Introduction to Thermodynamic Physics",
        "chapter": [1, 2]
    },
    {
        "name": "Neamen",
        "chapter": [3, 4, 5, 6, 7, 8]
    }
]

base_path = os.path.join(settings.BASE_DIR, "equationList/static/equationList/books")

contentJSON = json.dumps(content)


def pdfNote(request, title="Neamen", chapter="6", load=True):
    """
        to get the note saved in page
    """


    saveStateJson = os.path.join(base_path, title, chapter, "saveState.json")
    with open(saveStateJson) as file:
        # jsonFile = json.load(file)

        pageData = json.dumps(json.load(file))
        jsonFile = json.loads(pageData)
        print("*"*10)
        # book = jsonFile.get("book") or "default"
        book = jsonFile.get("book") or "default"
        print("*"*10)
    return render(request, 'equationList/pdfNote/pdfNote.html', {"pageData": pageData, "load": load, "title": title, "chapter": chapter, "book":book})


def recordPage(request):
    return render(request, 'equationList/record/record.html', {})


def getJSON(request, bookName="Neamen", chapter="6", type=""):
    bookName = request.GET.get("bookName")
    chapterNum = request.GET.get("chapter")
    with open("equationList/static/equationList/books/TOC/{}.json".format(bookName)) as f:
        chapterJSON = json.load(f)["chapter"+chapterNum][0]["equations"]
        return JsonResponse(chapterJSON)


def getEquationList(request, bookName="Neamen", chapter="6", type=""):
    if request.GET.get("bookName"):
        bookName = request.GET.get("bookName")
        chapter = request.GET.get("chapter")

    imageList = os.listdir("equationList/static/equationList/books/{}/Chapter {}".format(bookName, chapter))
    imageList = filter(lambda filename: filename.endswith("jpg"), imageList)

    def sortFileName(filename):
        return int(filename.split(".")[0])

    imageList = sorted(imageList, key=sortFileName)   # sort by age

    with open("equationList/static/equationList/books/TOC/{}.json".format(bookName)) as f:
        chapterJSON = json.load(f)["chapter3"][0]["equations"]

    return render(request, 'equationList/index.html', {'items': imageList, "chapterJSON": chapterJSON, "TOC": contentJSON})


def noteEditInterface(request):
    """
        To open an interface of the note
    """
    return render(request, 'equationList/noteIndex.html')


def tocPage(request):
    """
        To open the TOC page
    """
    #############
    # open the content file and show the contents
    #############
    with open(os.path.join(base_path, "currentLink.txt")) as f:
        line = f.readline()

    with open(os.path.join(base_path, "TOC.json")) as f:
        jsonTOC = json.load(f)

    return render(request, 'equationList/TOC.html', {"toc": jsonTOC, "line":line})

def questionBankPage(request):
    with open(os.path.join(base_path, "_QuestionBank", "QuestionBankQueue.json")) as queue_f:
        queueJSON = json.load(queue_f)["queue"]

    with open(os.path.join(base_path, "_QuestionBank", "QuestionBankData.json")) as data_f:
        dataJSON = json.load(data_f)
        for queue in queueJSON:
            title = queue["title"]
            chapter = queue["chapter"]
            cells = queue["cells"]

            if not dataJSON.get(title):
                dataJSON[title] = {}

            titleLevel = dataJSON[title]
            if not titleLevel.get(chapter):
                titleLevel[chapter] = {}

            chapterLevel = titleLevel[chapter]

            for cell in cells:
                cellID = str(cell["cellID"])
                if not chapterLevel.get(cellID):
                    chapterLevel[cellID] = {}

                cellLevel = chapterLevel[cellID]
                print(cell)
                cellLevel["cellTitle"] = cell["cellTitle"]
                cellLevel["cellID"] = str(cell["cellID"])
                cellLevel["sectionTitle"] = cell.get("sectionTitle") or "false"
                cellLevel["pinButton"] = cell["pinButton"]
                cellLevel["linkPdfPageButton"] = cell["linkPdfPageButton"]

                for annotation in cell["annotation"]:
                    annotationID = str(annotation["annotationID"])
                    if not cellLevel.get(annotationID):
                        cellLevel[annotationID] = annotation


        with open(os.path.join(base_path, "_QuestionBank", "QuestionBankData.json"), "w") as data_f_w:
            json.dump(dataJSON, data_f_w, indent=2)
            # bookDataArray = data_f.get("data")

    # with open(os.path.join(base_path, "_QuestionBank", "QuestionBankQueue.json"), "w") as queue_f_w:
    #     queueJSON = json.dump({"queue":[]}, queue_f_w)
    #

    #
    #     jsonFile = json.dumps(json.load(f))
    return render(request, 'equationList/QuestionBank/QuestionBank.html', {"data": dataJSON})

def collectionPage(request, title):
    """
        To open the collectionPage
    """
    #############
    # open the content file and show the contents
    #############
    if request.GET.get("title"):
        title = request.GET.get("title")
    print(title)

    with open(os.path.join(base_path,title, "important.json")) as f:
        jsonFile = json.dumps(json.load(f))

    # with open(os.path.join(base_path, "TOC.json")) as f:
    #     jsonTOC = json.load(f)

    return render(request, 'equationList/pdfNote/collection.html', {"collection": jsonFile, "title": title})


def notePage(request, title, chapter, load=True):
    """
        to get the note saved in page
    """
    saveStateJson = os.path.join(base_path, title, chapter, "saveState.json")

    with open(saveStateJson) as file:
        jsonFile = json.load(file)

        book = jsonFile["book"]
        pageData = json.dumps(book)

    return render(request, 'equationList/noteIndex.html', {"pageData": pageData, "load": load, "title": title, "chapter": chapter, "book": book})

def processAjaxRequest(request):
    """
        response to different request
        1. save state: to save the DOM of the current page
        2. load sate: to load the saveState.json from the database to a page
        3. save image: to response to the save image request from the page, and then return a url of the imagelink to the webpage
    """
    if request.method=="POST":
        jsonData = request.body
        dictResponse = json.loads(jsonData)
        chapter = dictResponse.get("chapter") or None
        bookTitle = dictResponse.get("title") or None
        todo = dictResponse["todo"]
        del dictResponse["todo"]

        if todo == "save record":
            print(dictResponse)
            with open(os.path.join(base_path, "__diaryRecord", "record.json")) as f:
                jsonFile = json.load(f)

            with open(os.path.join(base_path, "__diaryRecord", "record.json"), "w") as _f:
                currentDate = dictResponse["currentDate"]
                jsonFile["date"][currentDate] = dictResponse["data"]
                json.dump(jsonFile, _f, ensure_ascii=False, indent=4)

            return JsonResponse({"123": 45})

        if todo =="save useful":
            print(os.path.join(base_path, bookTitle, "important.json"))
            with open(os.path.join(base_path, bookTitle, "important.json")) as f:
                print(bookTitle)
                print("(&)"*29)
                # print(dictResponse)
                json.dump(dictResponse["pageData"], f)
            return JsonResponse({"123":35})

        if todo == "addToUseful":
            print("*"*30)

            with open(os.path.join(base_path, bookTitle, "important.json"), "w") as f:
                jsonFile = json.load(f)
                usefulAnnotationData = dictResponse["annotationData"]

                d = defaultdict(list, jsonFile)
                d[dictResponse["cellTitle"]].append(usefulAnnotationData)

                with open(os.path.join(base_path, bookTitle, "important.json"), "w") as _f:
                    json.dump(d, _f)
                # print(jsonFile, d)
                # print( usefulAnnotationData)

            # with open()

            return JsonResponse({"123":35})


        if todo == "save image":
            #### to save pdf image
            # folderName = chapter
            fileName = dictResponse["fileName"]
            imagePath = convertDataURLToLink(dictResponse["data"], bookTitle, chapter,fileName)
            imageData = {"src": imagePath}
            return JsonResponse(imageData)

        if todo == "save state":
            #############
            # save state
            # save the data inside the book folder
            # save the information of this information in the TOC file
            # #############
            print("*"*10)
            print("at line 127")
            print(dictResponse["cells"])
            print("*"*10)


            with open(os.path.join(base_path, "currentLink.txt"), "w") as f:
                    f.write("/equation/pdfNote/"+bookTitle+"/"+chapter)

            for cell in dictResponse["cells"]:
                for annotation in cell["annotation"]:
                    print("*"*20)
                    # print("Here is a cell")
                    # print(annotation)

                    if annotation["annotationType"]=="imageAnnotation":
                        reducedSavePath = convertDataURLToLink(annotation["src"], bookTitle, chapter, annotation["fileName"].strip())
                        annotation["src"] = reducedSavePath
                        print(annotation["src"][0:100])
                        print(reducedSavePath)
                    print("*"*20)

            with open(os.path.join(base_path, "TOC.json")) as f:
                jsonTOC = json.load(f)
                # print(jsonTOC)
                if jsonTOC.get(bookTitle):
                    chapterList = jsonTOC[bookTitle]
                    chapterList.append(chapter)
                    jsonTOC[bookTitle] = list(set(chapterList))

                else:
                    jsonTOC[bookTitle] = [chapter]
                    print("cannot find")
                #
                with open(os.path.join(base_path, "TOC.json"), "w") as _f:
                    json.dump(jsonTOC, _f)
                    # print("*"*20)
                    # print("updated the TOC")
                    # print("*"*20)


            toc_path = os.path.join(base_path, "TOC")


            # to save the saveState of the file
            book_path = os.path.join(base_path, bookTitle)
            if not os.path.exists(book_path):
                os.mkdir(book_path)
            chapter_path = os.path.join(book_path, chapter)
            if not os.path.exists(chapter_path):
                os.mkdir(chapter_path)

            with open(os.path.join(chapter_path, "saveState.json"), "w+") as f:
                # print(dictResponse)
                json.dump(dictResponse, f)
            return HttpResponse("the data is saved")

        #############
        # load state
        #############
        if todo ==  "load state":

            note_path = os.path.join(base_path, bookTitle, chapter,  "saveState.json")
            with open(note_path) as f:
                noteSaveData = json.load(f)
                # print(noteSaveData)

                # print("$"*20)
                return JsonResponse(noteSaveData)

        if todo == "addToQuestionBank":
            questionBankPath = os.path.join(base_path, "_QuestionBank", "QuestionBankQueue.json")
            with open(questionBankPath) as f:
                questionBankJSON = json.load(f)
                questionBankJSON["queue"].append(dictResponse)

                with open(questionBankPath, "w") as _f:
                    print(dictResponse)
                    json.dump(questionBankJSON, _f, indent=2)


                # print("$"*20)
                return JsonResponse(questionBankJSON)
        #############
        # save image

def convertDataURLToLink(img_dataURL, bookTitle, chapter, fileName, folderName=None):

    book_path = os.path.join(base_path, bookTitle)

    if not os.path.exists(book_path):
        os.mkdir(book_path)
    chapter_path = os.path.join(book_path, chapter)
    if not os.path.exists(chapter_path):
        os.mkdir(chapter_path)
    if img_dataURL.startswith("data:image"):
        img = img_dataURL.split(",")[1]
        img = Image.open(BytesIO(base64.b64decode(img))).convert("RGB")
        savePath = os.path.join(chapter_path, fileName+".jpg")

        # if folderName:
        #     print(fileName)
        #     folderPath = os.path.join(chapter_path, folderName)
        #     if not os.path.exists(folderPath):
        #         os.mkdir(folderPath)
        #     savePath = os.path.join(chapter_path, folderName, fileName+".jpg")

        img.save(savePath)
        reducedSavePath = "/static" + savePath.split("/static")[1]
        return reducedSavePath
    else:
        return img_dataURL

let counterButtons = document.querySelectorAll(".counter")


counterButtons.forEach(button=>{
    button.addEventListener("click", function(){
        console.log("Yeah");
        if (event.target.classList.contains("counter")){
            counterButtons.forEach(q=>{
                // q.style.background = "lightBlue"
                q.classList.remove("selected")
            })
            // event.target.style.background = "yellow"
            event.target.classList.add("selected")
        } // check if it is counter

    })
})
